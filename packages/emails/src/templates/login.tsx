import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

const primaryColor = "#060B14";

const LoginEmail = ({
  loginLink = "https://portal.example.com/login",
}: {
  loginLink: string;
}) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="mx-auto my-[32px] bg-[#f5f5f5] font-sans">
          <Container className="mx-auto max-w-[600px]">
            {/* Header */}
            <Section className="mt-16 text-center">
              <Link
                href="https://agentset.ai"
                className="text-[#060B14] no-underline"
              >
                <Heading className="m-0 text-[24px] font-bold">
                  Agentset.ai
                </Heading>
              </Link>
            </Section>

            {/* Main Content */}
            <Section
              className="mx-auto mt-6 rounded-xl bg-white px-8 py-5 shadow-sm"
              style={{ maxWidth: "450px" }}
            >
              <Text className="text-center text-base text-[#555]">
                Here's your requested login link.
              </Text>

              <Button
                href={loginLink}
                className="mt-6 box-border block w-full rounded-[999px] bg-[#060B14] px-[24px] py-[12px] text-center font-bold text-white"
              >
                Login
              </Button>

              <Text className="mt-6 text-center text-[14px] text-[#666]">
                If you're not trying to log in, ignore the email.
              </Text>

              <Text className="mt-2 text-center text-[12px] text-[#888] italic">
                Please note: This email contains a link that should only be used
                by you. Do not forward this email.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="mt-4 text-center text-[#555]">
              <Text className="text-[14px]">
                Questions? Contact us at{" "}
                <Link
                  href="mailto:support@agentset.ai"
                  className="text-[#060B14] underline"
                >
                  support@agentset.ai
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default LoginEmail;
