"use client";

import dynamic from "next/dynamic";

/*
 * The lazy boundary has to live in a client module. `dynamic()` called from a
 * server module still resolves every demo into the page's client manifest, so
 * each experiment page downloaded all fifteen — the split only happens once
 * webpack sees the `import()` inside the client graph. SSR stays on, so the
 * prerendered HTML still contains the demo.
 */

export const EmailClient = dynamic(() => import("./EmailClient"));
export const FamilyTransaction = dynamic(() => import("./FamilyTransaction"));
export const ShareInvite = dynamic(() => import("./ShareInvite"));
export const FamilyTray = dynamic(() => import("./FamilyTray"));
export const DownloadInteraction = dynamic(
  () => import("./DownloadInteraction")
);
export const TagsUI = dynamic(() => import("./TagsUI"));
export const TrashInteraction = dynamic(() => import("./TrashInteraction"));
export const MemoryCards = dynamic(() => import("./MemoryCards"));
export const Stepper = dynamic(() => import("./Stepper"));
export const LoginLinkButton = dynamic(() => import("./LoginLinkButton"));
export const DynamicIsland = dynamic(() => import("./DynamicIsland"));
export const ReactEmailFolders = dynamic(() => import("./ReactEmailFolders"));
export const ResendBentoGrid = dynamic(() => import("./ResendBentoGrid"));
export const DynamicSettings = dynamic(() => import("./DynamicSettings"));
export const DynamicVercelToolbar = dynamic(
  () => import("./DynamicVercelToolbar")
);
