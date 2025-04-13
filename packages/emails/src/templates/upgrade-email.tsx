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

export function UpgradeEmail({
  name = "John Doe",
  email = "john@doe.com",
  plan = {
    name: "Pro",
    features: [],
  },
}: {
  name: string | null;
  email: string;
  plan: {
    name: string;
    features?: {
      text: string;
      tooltip?: { title: string; cta: string; href: string };
    }[];
  };
}) {
  return (
    <Html>
      <Head />
      <Preview>Thank you for upgrading to Agentset {plan.name}!</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded border border-solid border-neutral-200 px-10 py-5">
            <Section className="mt-8">
              <Logo />
            </Section>
            <Heading className="mx-0 my-7 p-0 text-xl font-medium text-black">
              Thank you for upgrading to Agentset {plan.name}!
            </Heading>

            <Text className="text-sm leading-6 text-black">
              Hey{name && ` ${name}`}!
            </Text>
            <Text className="text-sm leading-6 text-black">
              My name is Abdellatif, and I'm the co-founder of Agentset.
            </Text>
            <Text className="text-sm leading-6 text-black">
              I wanted to personally reach out to thank you for upgrading to{" "}
              <strong>Agentset {plan.name}</strong>! Your support means the
              world to us and helps us continue to build and improve Agentset.
            </Text>
            {plan.features && plan.features.length > 0 ? (
              <>
                <Text className="text-sm leading-6 text-black">
                  On the {plan.name} plan, you now have access to:
                </Text>
                {plan.features.map((feature) => (
                  <Text className="ml-1 text-sm leading-4 text-black">
                    ◆{" "}
                    {feature.tooltip?.href ? (
                      <Link href={feature.tooltip.href}>{feature.text}</Link>
                    ) : (
                      feature.text
                    )}
                  </Text>
                ))}
              </>
            ) : null}
            <Text className="text-sm leading-6 text-black">
              If you have any questions or feedback about Agentset, please don't
              hesitate to reach out – I'm always happy to help!
            </Text>

            <Text className="text-sm leading-6 font-light text-neutral-400">
              Abdellatif from Agentset
            </Text>

            <Footer email={email} marketing />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default UpgradeEmail;
