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
} from '@react-email/components'

interface EmailVerificationProps {
  userName: string
  verificationUrl: string
  expiresIn: string
}

export default function EmailVerification({
  userName,
  verificationUrl,
  expiresIn,
}: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Vérifiez votre adresse email</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✉️ Vérifiez votre email</Heading>

          <Text style={text}>Bonjour {userName},</Text>

          <Text style={text}>
            Merci de vous être inscrit ! Pour finaliser votre inscription et accéder à toutes les
            fonctionnalités, veuillez vérifier votre adresse email en cliquant sur le bouton
            ci-dessous.
          </Text>

          <Button style={button} href={verificationUrl}>
            Vérifier mon email
          </Button>

          <Text style={text}>
            Ce lien expirera dans <strong>{expiresIn}</strong>.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.
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
