import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Hr,
  Section,
} from '@react-email/components'

interface OnboardingTipsProps {
  userName: string
  dashboardUrl: string
}

export default function OnboardingTips({ userName, dashboardUrl }: OnboardingTipsProps) {
  return (
    <Html>
      <Head />
      <Preview>Conseils pour bien démarrer</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>💡 Conseils pour bien démarrer</Heading>

          <Text style={text}>Bonjour {userName},</Text>

          <Text style={text}>
            Vous êtes inscrit depuis quelques jours maintenant ! Voici quelques astuces pour tirer
            le meilleur parti de notre plateforme :
          </Text>

          <Section style={tipSection}>
            <Text style={tipTitle}>🎯 1. Complétez votre profil</Text>
            <Text style={tipText}>
              Un profil complet vous permettra de profiter pleinement de toutes les fonctionnalités.
            </Text>
          </Section>

          <Section style={tipSection}>
            <Text style={tipTitle}>🔔 2. Configurez vos notifications</Text>
            <Text style={tipText}>
              Restez informé des événements importants en personnalisant vos préférences de
              notifications.
            </Text>
          </Section>

          <Section style={tipSection}>
            <Text style={tipTitle}>🤝 3. Invitez votre équipe</Text>
            <Text style={tipText}>
              Travaillez plus efficacement en collaborant avec votre équipe sur la plateforme.
            </Text>
          </Section>

          <Button style={button} href={dashboardUrl}>
            Accéder au tableau de bord
          </Button>

          <Hr style={hr} />

          <Text style={footer}>
            Besoin d'aide ? N'hésitez pas à nous contacter, nous sommes là pour vous accompagner !
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 48px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 48px',
}

const tipSection = {
  margin: '20px 48px',
}

const tipTitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '8px',
}

const tipText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '4px',
}

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
  margin: '27px 48px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 48px',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 48px',
}
