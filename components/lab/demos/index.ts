/*
 * The MDX component map has to name every demo, because any post might use any
 * of them — but a post renders exactly one. These are the lazy handles from
 * `./lazy`, so an experiment page downloads only the demo it names instead of
 * all fifteen (and framer-motion with them).
 */

import {
  DownloadInteraction,
  DynamicIsland,
  DynamicSettings,
  DynamicVercelToolbar,
  EmailClient,
  FamilyTransaction,
  FamilyTray,
  LoginLinkButton,
  MemoryCards,
  ReactEmailFolders,
  ResendBentoGrid,
  ShareInvite,
  Stepper,
  TagsUI,
  TrashInteraction,
} from "./lazy";

const labComponents = {
  EmailClient,
  FamilyTransaction,
  ShareInvite,
  FamilyTray,
  DownloadInteraction,
  TagsUI,
  TrashInteraction,
  MemoryCards,
  Stepper,
  LoginLinkButton,
  DynamicIsland,
  ReactEmailFolders,
  ResendBentoGrid,
  DynamicSettings,
  DynamicVercelToolbar,
};

export default labComponents;
