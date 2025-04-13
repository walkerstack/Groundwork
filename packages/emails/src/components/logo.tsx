import { Heading, Link } from "@react-email/components";

// import { Img } from "@react-email/components";
// export const Logo = () => {
//   return <Img src="https://agentset.ai/logo.png" height="32" alt="Agentset" />;
// };

export const Logo = () => {
  return (
    <Link href="https://agentset.ai" className="text-[#060B14] no-underline">
      <Heading className="m-0 text-[24px] font-bold">Agentset.ai</Heading>
    </Link>
  );
};
