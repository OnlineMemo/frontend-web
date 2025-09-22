import { lazy } from 'react'

export const retryLazy = (componentImport) =>
    lazy(async () => {
        const pageAlreadyRefreshed = JSON.parse(
            window.localStorage.getItem('pageRefreshed') || 'false'
        );

        try {
            const component = await componentImport();
            // lazy import 성공 시
            window.localStorage.setItem('pageRefreshed', 'false');
            return component;
        } catch (error) {
            // lazy import 실패 시
            if (!pageAlreadyRefreshed) {
                window.localStorage.setItem('pageRefreshed', 'true');
                return window.location.reload();
            }

            throw error;
        }
    });