import { parseToken } from "./TokenUtil";

const removePinnedMemoId = (memoId) => {
    try {
        const userId = parseToken().decodedId;
        const allPinnedInfo = JSON.parse(localStorage.getItem('pinnedMemoIds')) || {};
        const myPinnedMemoIds = allPinnedInfo[userId] || [];
        if (!myPinnedMemoIds.includes(memoId)) return;
        allPinnedInfo[userId] = myPinnedMemoIds.filter(id => id !== memoId);
        localStorage.setItem('pinnedMemoIds', JSON.stringify(allPinnedInfo));
    } catch { }
}

const removeAllPinnedMemoIds = () => {
    try {
        const userId = parseToken().decodedId;
        const allPinnedInfo = JSON.parse(localStorage.getItem('pinnedMemoIds')) || {};
        if (!(userId in allPinnedInfo)) return;
        delete allPinnedInfo[userId];
        localStorage.setItem('pinnedMemoIds', JSON.stringify(allPinnedInfo));
    } catch { }
}

export { removePinnedMemoId, removeAllPinnedMemoIds };