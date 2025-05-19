"use client";

import DiscordIcon from "@/components/icons/discord";
import DropboxIcon from "@/components/icons/dropbox";
import GmailIcon from "@/components/icons/gmail";
import GoogleDriveIcon from "@/components/icons/google-drive";
import NotionIcon from "@/components/icons/notion";
import OneDriveIcon from "@/components/icons/onedrive";
import S3Icon from "@/components/icons/s3";
import SlackIcon from "@/components/icons/slack";
import { OrbitingCircles } from "@/components/orbiting-circles";
import { Button } from "@/components/ui/button";

export default function EmptyState() {
  return (
    <div className="border-border w-full rounded-md border py-16">
      <div className="relative flex h-[350px] w-full flex-col items-center justify-center overflow-hidden">
        <OrbitingCircles iconSize={40} speed={0.1} radius={150}>
          <NotionIcon />
          <GoogleDriveIcon />
          <OneDriveIcon />
          <DropboxIcon />
          <S3Icon />
        </OrbitingCircles>

        <OrbitingCircles iconSize={32} radius={80} reverse speed={0.15}>
          <DiscordIcon />
          <GmailIcon />
          <SlackIcon />
        </OrbitingCircles>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-semibold">Connectors</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Import your data from your favorite tools
        </p>

        <Button asChild className="mt-5">
          <a href="mailto:support@agentset.ai" target="_blank">
            Get Access
          </a>
        </Button>
      </div>
    </div>
  );
}
