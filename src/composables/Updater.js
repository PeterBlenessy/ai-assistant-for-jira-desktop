import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { ref } from "vue";
import { useLogger } from "./Logger";

export function useUpdater() {
    const logger = useLogger();
    const updateInfo = ref(null);
    const downloaded = ref(0);
    const contentLength = ref(0);

    const checkForUpdates = async () => {
        logger.info("[updater] - checking for updates");
        const update = await check();
        if (update) {
            updateInfo.value = update;
            logger.info(
                `[updater] Found update ${update.version} from ${update.date} with following release notes \n${update.body}`,
            );
        } else {
            logger.info("[updater] No updates found");
        }

        return update;
    };

    const downloadAndInstall = async () => {
        const update = await check();
        if (update) {
            await update.downloadAndInstall((event) => {
                switch (event.event) {
                    case "Started":
                        contentLength.value = event.data.contentLength;
                        logger.info(
                            `[updater] Started downloading ${event.data.contentLength} bytes`,
                        );
                        break;
                    case "Progress":
                        downloaded.value += event.data.chunkLength;
                        logger.info(
                            `downloaded ${downloaded.value} from ${contentLength.value}`,
                        );
                        break;
                    case "Finished":
                        logger.info("[updater] Download finished");
                        break;
                }
            });

            logger.info("[updater] Update installed");
        }
    };

    const relaunchApp = async () => {
        logger.info("[updater] Relaunching application");
        await relaunch();
    };

    return {
        updateInfo,
        downloaded,
        contentLength,

        checkForUpdates,
        downloadAndInstall,
        relaunchApp,
    };
}
