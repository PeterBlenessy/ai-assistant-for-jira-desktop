import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { ref } from "vue";

export function useUpdater() {
    const updateInfo = ref(null);
    const downloaded = ref(0);
    const contentLength = ref(0);

    const checkForUpdates = async () => {
        console.log("[updater] - checking for updates");
        const update = await check();
        if (update) {
            updateInfo.value = update;
            console.log(
                `[updater] - found update ${update.version} from ${update.date} with following release notes \n${update.body}`,
            );
        } else {
            console.log("[updater] - no updates found");
        }

        return update;
    };

    const downloadAndInstall = async (update) => {
        if (update) {
            await update.downloadAndInstall((event) => {
                switch (event.event) {
                    case "Started":
                        contentLength.value = event.data.contentLength;
                        console.log(
                            `[updater] - started downloading ${event.data.contentLength} bytes`,
                        );
                        break;
                    case "Progress":
                        downloaded.value += event.data.chunkLength;
                        console.log(
                            `downloaded ${downloaded.value} from ${contentLength.value}`,
                        );
                        break;
                    case "Finished":
                        console.log("[updater] - download finished");
                        break;
                }
            });

            console.log("[updater] - update installed");
        }
    };

    const relaunchApp = async () => {
        console.log("[updater] - relaunching application");
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
