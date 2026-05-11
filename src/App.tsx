import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  ErrorComponent,
  RefineSnackbarProvider,
  ThemedLayout,
  useNotificationProvider,
} from "@refinedev/mui";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";
import LeaderboardRounded from "@mui/icons-material/LeaderboardRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import SportsGolfRounded from "@mui/icons-material/SportsGolfRounded";
import Navkit from '@taruvi/navkit';
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import routerProvider, { DocumentTitleHandler } from "@refinedev/react-router";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { taruviClient } from "./taruviClient";
import {
  taruviDataProvider,
  taruviAuthProvider,
  taruviStorageProvider,
  taruviFunctionsProvider,
  taruviAppProvider,
  taruviUserProvider,
  taruviAnalyticsProvider,
  // taruviAccessControlProvider, // Uncomment to enable Cerbos-based access control
} from "./providers/refineProviders";
import { CustomSider, UnsavedChangesDialog } from "./components";
import { LoginRedirect } from "./components/auth/LoginRedirect";
import { GolfLiveSyncBridge } from "./components/golf/GolfLiveSyncBridge";
import { ColorModeContextProvider, ColorModeContext } from "./contexts/color-mode";
import {AppSettingsProvider, useAppSettings} from "./contexts/app-settings";
import { useContext, useRef, useEffect } from "react";
import { Home } from "./pages/home";
import { GolfDraftPickList, GolfDraftPickShow } from "./pages/golf-draft-picks";
import { GolfGolferCreate, GolfGolferEdit, GolfGolferList, GolfGolferShow } from "./pages/golf-golfers";
import { GolfPoolSettingsEdit, GolfPoolSettingsList, GolfPoolSettingsShow } from "./pages/golf-pool-settings";
import { GolfScoreEdit, GolfScoreList, GolfScoreShow } from "./pages/golf-scores";
import {
  GolfTournamentCreate,
  GolfTournamentEdit,
  GolfTournamentList,
  GolfTournamentShow,
} from "./pages/golf-tournaments";

const AppContent = () => {
  const { setMode } = useContext(ColorModeContext);
  const navRef = useRef<HTMLDivElement>(null);
  const { settings } = useAppSettings();

  useEffect(() => {
    if (navRef.current) {
      const height = navRef.current.offsetHeight;
      document.documentElement.style.setProperty('--nav-height', `${height}px`);
    }
  }, []);

  return (
    <>
      <div
        ref={navRef}
        data-nav-container
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1300,
          width: '100%',
        }}
      >
        <Navkit
          client={taruviClient}
          getTheme={(theme) => setMode(theme)}
        />
      </div>
      <RefineSnackbarProvider>
            <DevtoolsProvider>
              <Refine
                dataProvider={{
                  default: taruviDataProvider,
                  storage: taruviStorageProvider,
                  functions: taruviFunctionsProvider,
                  app: taruviAppProvider,
                  user: taruviUserProvider,
                  analytics: taruviAnalyticsProvider,
                }}
                notificationProvider={useNotificationProvider}
                routerProvider={routerProvider}
                authProvider={taruviAuthProvider}
                // accessControlProvider={taruviAccessControlProvider} // Uncomment to enable Cerbos-based access control
                resources={[
                  {
                    name: "golf_draft_picks",
                    list: "/draft",
                    show: "/draft/show/:id",
                    meta: { label: "Draft Board", icon: <LeaderboardRounded /> },
                  },
                  {
                    name: "golf_golfers",
                    list: "/golfers",
                    create: "/golfers/create",
                    edit: "/golfers/edit/:id",
                    show: "/golfers/show/:id",
                    meta: { label: "Golfers", icon: <SportsGolfRounded />, canDelete: true },
                  },
                  {
                    name: "golf_scores",
                    list: "/scores",
                    edit: "/scores/edit/:id",
                    show: "/scores/show/:id",
                    meta: { label: "Scores", icon: <LeaderboardRounded /> },
                  },
                  {
                    name: "golf_tournaments",
                    list: "/tournaments",
                    create: "/tournaments/create",
                    edit: "/tournaments/edit/:id",
                    show: "/tournaments/show/:id",
                    meta: { label: "Tournaments", icon: <EmojiEventsRounded />, canDelete: true },
                  },
                  {
                    name: "golf_pool_settings",
                    list: "/settings",
                    edit: "/settings/edit/:id",
                    show: "/settings/show/:id",
                    meta: { label: "Settings", icon: <SettingsRounded /> },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  projectId: "obEpHJ-M7JimA-31GF1J",
                }}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-inner"
                        fallback={<LoginRedirect />}
                      >
                        <ThemedLayout Header={() => null} Sider={CustomSider} initialSiderCollapsed={true}>
                          <Box
                            sx={{
                              ml: { xs: 0, md: "72px" },
                              minHeight: "calc(100vh - var(--nav-height, 60px))",
                              transition: "margin-left 0.2s ease-in-out",
                            }}
                          >
                            <GolfLiveSyncBridge />
                            <Outlet />
                          </Box>
                        </ThemedLayout>
                      </Authenticated>
                    }
                  >
                    <Route index element={<Home />} />
                    <Route path="draft" element={<GolfDraftPickList />} />
                    <Route path="draft/show/:id" element={<GolfDraftPickShow />} />
                    <Route path="managers/*" element={<Navigate to="/draft" replace />} />
                    <Route path="golfers" element={<GolfGolferList />} />
                    <Route path="golfers/create" element={<GolfGolferCreate />} />
                    <Route path="golfers/edit/:id" element={<GolfGolferEdit />} />
                    <Route path="golfers/show/:id" element={<GolfGolferShow />} />
                    <Route path="scores" element={<GolfScoreList />} />
                    <Route path="scores/edit/:id" element={<GolfScoreEdit />} />
                    <Route path="scores/show/:id" element={<GolfScoreShow />} />
                    <Route path="tournaments" element={<GolfTournamentList />} />
                    <Route path="tournaments/create" element={<GolfTournamentCreate />} />
                    <Route path="tournaments/edit/:id" element={<GolfTournamentEdit />} />
                    <Route path="tournaments/show/:id" element={<GolfTournamentShow />} />
                    <Route path="settings" element={<GolfPoolSettingsList />} />
                    <Route path="settings/edit/:id" element={<GolfPoolSettingsEdit />} />
                    <Route path="settings/show/:id" element={<GolfPoolSettingsShow />} />
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesDialog />
                <DocumentTitleHandler handler={() => settings?.displayName || ""}/>
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </RefineSnackbarProvider>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AppSettingsProvider>
            <CssBaseline />
            <GlobalStyles
              styles={(theme) => ({
                html: { WebkitFontSmoothing: "auto" },
                body: { minHeight: "100vh" },
                "::selection": {
                  backgroundColor:
                    theme.palette.mode === "dark" ? "rgba(123, 187, 114, 0.28)" : "rgba(31, 106, 58, 0.18)",
                },
                a: {
                  color: theme.palette.primary.main,
                },
              })}
            />
            <AppContent />
          </AppSettingsProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
