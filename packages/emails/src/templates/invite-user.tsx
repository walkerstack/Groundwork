import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { Footer } from "../components/footer";
import { Logo } from "../components/logo";

export function OrganizationInvite({
  email = "john@doe.com",
  url = "http://localhost:8888/api/auth/callback/email?callbackUrl=http%3A%2F%2Fapp.localhost%3A3000%2Flogin&token=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&email=youremail@gmail.com",
  organizationName = "Acme",
  organizationUser = "Brendon Urie",
  organizationUserEmail = "panic@thedis.co",
}: {
  email: string;
  url: string;
  organizationName: string;
  organizationUser?: string | null;
  organizationUserEmail: string;
}) {
  const emailLink = (
    <Link
      className="text-blue-600 no-underline"
      href={`mailto:${organizationUserEmail}`}
    >
      {organizationUserEmail}
    </Link>
  );

  return (
    <Html>
      <Head />
      <Preview>Join {organizationName} on Agentset</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded border border-solid border-neutral-200 px-10 py-5">
            <Section className="mt-8">
              <Logo />
            </Section>
            <Heading className="mx-0 my-7 p-0 text-xl font-medium text-black">
              Join {organizationName} on Agentset
            </Heading>
            {organizationUser || organizationUserEmail ? (
              <Text className="text-sm leading-6 text-black">
                {organizationUser ? (
                  <>
                    <strong>{organizationUser}</strong> ({emailLink})
                  </>
                ) : (
                  emailLink
                )}{" "}
                has invited you to join the <strong>{organizationName}</strong>{" "}
                organization on Agentset!
              </Text>
            ) : (
              <Text className="text-sm leading-6 text-black">
                You have been invited to join the{" "}
                <strong>{organizationName}</strong> organization on Agentset!
              </Text>
            )}
            <Section className="mt-8 mb-8">
              <Link
                className="rounded-lg bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={url}
              >
                Join Organization
              </Link>
            </Section>
            <Text className="text-sm leading-6 text-black">
              or copy and paste this URL into your browser:
            </Text>
            <Text className="max-w-sm flex-wrap font-medium break-words text-purple-600 no-underline">
              {url.replace(/^https?:\/\//, "")}
            </Text>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default OrganizationInvite;
