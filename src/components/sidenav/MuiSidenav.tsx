import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Dashboard from "@mui/icons-material/Dashboard";
import Logout from "@mui/icons-material/Logout";

import {
  useMenu,
  useLogout,
  useIsExistAuthentication,
  useTranslate,
  useWarnAboutChange,
} from "@refinedev/core";

import { MenuItem } from "./MenuItem";
import { MobileBottomNav } from "./MobileBottomNav";
import "./sidenav.css";

const DRAWER_WIDTH_EXPANDED = 240;
const DRAWER_WIDTH_COLLAPSED = 72;
const MAX_LABEL_EXPANDED = 40;

const truncateLabel = (text: string, expanded: boolean) => {
  if (expanded) {
    return text.length > MAX_LABEL_EXPANDED ? text.slice(0, MAX_LABEL_EXPANDED) + "…" : text;
  }
  return text;
};

interface MuiSidenavProps {
  meta?: Record<string, unknown>;
}

export const MuiSidenav: React.FC<MuiSidenavProps> = ({ meta }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslate();

  const { menuItems, selectedKey } = useMenu({ meta });
  const isAuthenticated = useIsExistAuthentication();
  const { mutate: mutateLogout } = useLogout();
  const { warnWhen, setWarnWhen } = useWarnAboutChange();

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleNavigate = useCallback(
    (route: string) => {
      navigate(route);
    },
    [navigate]
  );

  const handleLogout = useCallback(() => {
    if (warnWhen) {
      const confirm = window.confirm(
        t(
          "warnWhenUnsavedChanges",
          "Are you sure you want to leave? You have unsaved changes."
        )
      );
      if (confirm) {
        setWarnWhen(false);
        mutateLogout();
      }
    } else {
      mutateLogout();
    }
  }, [warnWhen, setWarnWhen, mutateLogout, t]);

  const isDashboardSelected = location.pathname === "/";
  const drawerWidth = expanded ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_COLLAPSED;

  const dashboardButton = (
    <ListItemButton
      onClick={() => handleNavigate("/")}
      selected={isDashboardSelected}
      sx={{
        minHeight: 48,
        flexDirection: expanded ? "row" : "column",
        justifyContent: expanded ? "initial" : "center",
        alignItems: "center",
        borderRadius: expanded ? 1 : 0,
        mx: expanded ? 1 : 0,
        mb: 0.5,
        py: expanded ? 1 : 1.5,
        color: isDashboardSelected ? "primary.dark" : "text.primary",
        "&.Mui-selected": {
          backgroundColor: "rgba(31, 106, 58, 0.12)",
          borderLeft: (theme) => expanded ? `3px solid ${theme.palette.primary.main}` : "none",
        },
        "&.Mui-selected:hover": {
          backgroundColor: "rgba(31, 106, 58, 0.18)",
        },
        "&:hover": {
          backgroundColor: "rgba(31, 106, 58, 0.08)",
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 0,
          mr: expanded ? 2 : 0,
          justifyContent: "center",
          color: isDashboardSelected ? "primary.main" : "secondary.main",
        }}
      >
        <Dashboard />
      </ListItemIcon>
      {expanded ? (
        <ListItemText
          primary={truncateLabel(t("dashboard.title", "Dashboard"), expanded)}
          sx={{
            m: 0,
            textAlign: "left",
          }}
          primaryTypographyProps={{
            fontSize: 14,
            fontWeight: isDashboardSelected ? 600 : 500,
            noWrap: true,
          }}
        />
      ) : null}
    </ListItemButton>
  );

  const logoutButton = (
    <ListItemButton
      onClick={handleLogout}
      sx={{
        minHeight: 48,
        flexDirection: expanded ? "row" : "column",
        justifyContent: expanded ? "initial" : "center",
        alignItems: "center",
        borderRadius: expanded ? 1 : 0,
        mx: expanded ? 1 : 0,
        mb: 0.5,
        py: expanded ? 1 : 1.5,
        "&:hover": {
          backgroundColor: "rgba(140, 106, 54, 0.08)",
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 0,
          mr: expanded ? 2 : 0,
          justifyContent: "center",
          color: "secondary.main",
        }}
      >
        <Logout />
      </ListItemIcon>
      {expanded ? (
        <ListItemText
          primary={truncateLabel(t("buttons.logout", "Logout"), expanded)}
          sx={{
            m: 0,
            textAlign: "left",
          }}
          primaryTypographyProps={{
            fontSize: 14,
            fontWeight: 500,
            noWrap: true,
          }}
        />
      ) : null}
    </ListItemButton>
  );

  return (
    <>
      {/* Desktop Sidenav */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            position: "fixed",
            top: "var(--nav-height, 60px)",
            left: 0,
            height: "calc(100vh - var(--nav-height, 60px))",
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: 1,
            borderColor: "divider",
            transition: "width 0.2s ease-in-out",
            overflowX: "hidden",
            zIndex: 1200,
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(180deg, rgba(19, 35, 26, 0.98), rgba(15, 27, 20, 0.98))"
                : "linear-gradient(180deg, rgba(248, 244, 234, 0.98), rgba(240, 246, 235, 0.98))",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "8px 0 28px rgba(0, 0, 0, 0.2)"
                : "8px 0 32px rgba(44, 73, 42, 0.08)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Toggle Button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: expanded ? "flex-end" : "center",
              p: 1,
            }}
          >
            <IconButton onClick={handleToggle}>
              {expanded ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          </Box>

          <Divider />

          {/* Menu Items */}
          <List sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden", py: 1 }}>
            {/* Dashboard */}
            {dashboardButton}

            {/* Resource Menu Items */}
            {menuItems.map((item) => (
              <MenuItem
                key={item.key || item.name}
                item={item}
                selectedKey={selectedKey || location.pathname}
                expanded={expanded}
                onNavigate={handleNavigate}
              />
            ))}
          </List>

          {/* Logout */}
        </Box>
      </Drawer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        menuItems={menuItems}
        selectedKey={selectedKey || location.pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
    </>
  );
};
