import type { HttpContext } from '@adonisjs/core/http'
import User from '#users/models/user'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import type UserRepository from '#users/repositories/user_repository'
import db from '@adonisjs/lucid/services/db'
import { updateUserValidator } from '#admin/validators/update_user_validator'

export default class AdminController {
  async index({ inertia, session }: HttpContext) {
    const userId = session.get('user_id')
    const user = await User.findOrFail(userId)

    // Évolution des utilisateurs (30 derniers jours)
    const usersGrowth = await db
      .from('users')
      .select(db.raw("DATE(created_at) as date, COUNT(*) as count"))
      .whereRaw("created_at >= NOW() - INTERVAL '30 days'")
      .groupBy('date')
      .orderBy('date', 'asc')

    // Évolution des sessions (30 derniers jours)
    const sessionsGrowth = await db
      .from('user_sessions')
      .select(db.raw("DATE(started_at) as date, COUNT(*) as count"))
      .whereRaw("started_at >= NOW() - INTERVAL '30 days'")
      .groupBy('date')
      .orderBy('date', 'asc')

    // Sessions par utilisateur
    const sessionsPerUser = await db
      .from('user_sessions')
      .select('user_id')
      .count('* as session_count')
      .groupBy('user_id')

    const avgSessionsPerUser =
      sessionsPerUser.reduce((sum, u) => sum + Number(u.session_count), 0) /
      (sessionsPerUser.length || 1)

    // Utilisateurs actifs vs inactifs (30 jours)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activeUsers = await db
      .from('user_sessions')
      .select('user_id')
      .where('last_activity', '>=', thirtyDaysAgo)
      .groupBy('user_id')

    const totalUsers = await db.from('users').count('* as count').first()
    const activeCount = activeUsers.length
    const inactiveCount = Number(totalUsers?.count || 0) - activeCount

    return inertia.render('admin/index', {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
      stats: {
        usersGrowth: usersGrowth.map((row) => ({
          date: row.date,
          count: Number(row.count),
        })),
        sessionsGrowth: sessionsGrowth.map((row) => ({
          date: row.date,
          count: Number(row.count),
        })),
        avgSessionsPerUser: Math.round(avgSessionsPerUser * 100) / 100,
        activeUsers: activeCount,
        inactiveUsers: inactiveCount,
        totalUsers: Number(totalUsers?.count || 0),
      },
    })
  }

  async users({ inertia }: HttpContext) {
    const userRepository = getService<UserRepository>(TYPES.UserRepository)
    const users = await userRepository.findAll()

    // Récupérer la dernière activité de chaque utilisateur
    const lastActivities = await db
      .from('user_sessions')
      .select('user_id')
      .max('last_activity as last_activity')
      .groupBy('user_id')

    const lastActivityMap = new Map(
      lastActivities.map((row) => [row.user_id, row.last_activity])
    )

    const formattedUsers = users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      googleId: user.googleId,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt.toISO(),
      lastActivity: lastActivityMap.get(user.id) || null,
    }))

    return inertia.render('admin/users', {
      users: formattedUsers,
    })
  }

  async userDetail({ params, inertia }: HttpContext) {
    const userRepository = getService<UserRepository>(TYPES.UserRepository)
    const user = await userRepository.findById(params.id)

    // Récupérer toutes les sessions de l'utilisateur
    const sessions = await db
      .from('user_sessions')
      .where('user_id', params.id)
      .orderBy('last_activity', 'desc')

    return inertia.render('admin/user-detail', {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        googleId: user.googleId,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt.toISO(),
        updatedAt: user.updatedAt.toISO(),
      },
      sessions: sessions.map((session) => ({
        id: session.id,
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        startedAt: session.started_at,
        lastActivity: session.last_activity,
        endedAt: session.ended_at,
        isActive: session.is_active,
        country: session.country,
        city: session.city,
        deviceType: session.device_type,
        os: session.os,
        browser: session.browser,
      })),
    })
  }

  async updateUser({ params, request, response, session }: HttpContext) {
    const userRepository = getService<UserRepository>(TYPES.UserRepository)
    const data = await request.validateUsing(updateUserValidator)

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const existingUser = await userRepository.findOneBy({ email: data.email })
    if (existingUser && existingUser.id !== params.id) {
      return response.status(422).json({
        errors: {
          email: 'Cet email est déjà utilisé par un autre utilisateur',
        },
      })
    }

    const user = await userRepository.update(params.id, data)

    session.flash('success', 'Utilisateur mis à jour avec succès')
    return response.redirect().back()
  }
}
