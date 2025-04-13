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

export function FailedPayment({
  user = { name: "John Doe", email: "john@doe.com" },
  organization = { name: "Agentset", slug: "agentset" },
  amountDue = 49,
  attemptCount = 2,
}: {
  user: { name?: string | null; email: string };
  organization: { name: string; slug: string };
  amountDue: number;
  attemptCount: number;
}) {
  const title = `${
    attemptCount == 2 ? "2nd notice: " : attemptCount == 3 ? "3rd notice: " : ""
  }Your payment for Agentset failed`;

  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded border border-solid border-neutral-200 px-10 py-5">
            <Section className="mt-8">
              <Logo />
            </Section>
            <Heading className="mx-0 my-7 p-0 text-lg font-medium text-black">
              {attemptCount == 2 ? "2nd " : attemptCount == 3 ? "3rd  " : ""}
              Failed Payment for Agentset
            </Heading>
            <Text className="text-sm leading-6 text-black">
              Hey{user.name ? `, ${user.name}` : ""}!
            </Text>
            <Text className="text-sm leading-6 text-black">
              Your payment of{" "}
              <code className="text-purple-600">${amountDue / 100}</code> for
              your Agentset organization{" "}
              <code className="text-purple-600">{organization.name}</code> has
              failed. Please update your payment information using the link
              below:
              {/* TODO: add link for help article */}
            </Text>
            <Section className="my-8">
              <Link
                className="rounded-lg bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={`https://app.agentset.ai/${organization.slug}/settings/billing`}
              >
                Update payment information
              </Link>
            </Section>
            <Text className="text-sm leading-6 text-black">
              If you have any questions, feel free to respond to this email –
              we're happy to help!
            </Text>
            <Footer email={user.email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default FailedPayment;
