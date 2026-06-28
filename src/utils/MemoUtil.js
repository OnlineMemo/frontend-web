import { parseToken } from "./TokenUtil";

// ============ < Pinned Memo > ============ //

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


// ============ < Unsaved Memo > ============ //

const getUnsavedMemoKey = (type, id) => type === "edit" ? `edit_${id}` : "new";

const saveUnsavedMemo = (type, id, title, content) => {
    try {
        const userId = parseToken().decodedId;
        const key = getUnsavedMemoKey(type, id);
        const allUnsavedInfo = JSON.parse(localStorage.getItem("unsavedMemos")) || {};
        if (!allUnsavedInfo[userId]) allUnsavedInfo[userId] = {};
        allUnsavedInfo[userId][key] = { savedAt: Date.now(), title, content };
        localStorage.setItem("unsavedMemos", JSON.stringify(allUnsavedInfo));
    } catch { }
};

const getUnsavedMemo = (type, id) => {
    try {
        const userId = parseToken().decodedId;
        const key = getUnsavedMemoKey(type, id);
        const allUnsavedInfo = JSON.parse(localStorage.getItem("unsavedMemos")) || {};
        return allUnsavedInfo[userId]?.[key] || null;
    } catch { return null; }
};

const removeUnsavedMemo = (type, id) => {
    try {
        const userId = parseToken().decodedId;
        const key = getUnsavedMemoKey(type, id);
        const allUnsavedInfo = JSON.parse(localStorage.getItem("unsavedMemos")) || {};
        if (!allUnsavedInfo[userId]?.[key]) return;
        delete allUnsavedInfo[userId][key];
        if (Object.keys(allUnsavedInfo[userId]).length === 0) delete allUnsavedInfo[userId];
        localStorage.setItem("unsavedMemos", JSON.stringify(allUnsavedInfo));
    } catch { }
};

const removeAllUnsavedMemos = () => {
    try {
        const userId = parseToken().decodedId;
        const allUnsavedInfo = JSON.parse(localStorage.getItem("unsavedMemos")) || {};
        if (!(userId in allUnsavedInfo)) return;
        delete allUnsavedInfo[userId];
        localStorage.setItem("unsavedMemos", JSON.stringify(allUnsavedInfo));
    } catch { }
};

export { removePinnedMemoId, removeAllPinnedMemoIds, saveUnsavedMemo, getUnsavedMemo, removeUnsavedMemo, removeAllUnsavedMemos };