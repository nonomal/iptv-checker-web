import * as React from 'react';
import { useEffect, useState, useContext } from "react"
import { useNavigate } from 'react-router-dom';
import { Outlet } from "react-router-dom";
import './menu.css'
import { MainContext } from './../../context/main';
import icon from './../../assets/icon.png';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SettingsIcon from '@mui/icons-material/Settings';
import AdjustIcon from '@mui/icons-material/Adjust';
import PublicIcon from '@mui/icons-material/Public';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import _package from './../../../package';
import { useTranslation, initReactI18next } from "react-i18next";
import { appWindow } from '@tauri-apps/api/window'
import Divider from '@mui/material/Divider';

let menuList = [{
    "name": "检测源",
    "uri": "/check",
    "icon": "AdjustIcon",
    'showMod':[0,1],
    'showHeader': true
}, {
    "name": "公共订阅源",
    "uri": "/public",
    "icon": "PublicIcon",
    'showMod':[0,1],
    'showHeader': true
},{
    "name": "在线观看",
    "uri": "/watch",
    "icon": "RemoveRedEyeIcon",
    'showMod':[1],
    'showHeader': true
}, {
    "name": "定时检查任务",
    "uri": "/task",
    "icon": "CloudQueueIcon",
    'showMod':[0,1],
    'showHeader': true
}, {
    "name": "系统设置",
    "uri": "/settings",
    "icon": "SettingsIcon",
    'showMod':[0,1],
    'showHeader': true
}]

export default function Layout() {
    const { t } = useTranslation();
    const _mainContext = useContext(MainContext);
    const navigate = useNavigate();
    const [nowSelectedMenu, setNowSelectedMenu] = useState({
        "name": "检测源",
        "ename":"menu source check",
        "uri": "/check",
        "icon": "AdjustIcon",
        'showMod':[0,1]
    })

    const nowVersion = _package.version;

    useEffect(() => {
        document
        .getElementById('titlebar-minimize')
        .addEventListener('click', () => appWindow.minimize())
        document
        .getElementById('titlebar-maximize')
        .addEventListener('click', () => appWindow.toggleMaximize())
        document
        .getElementById('titlebar-close')
        .addEventListener('click', () => appWindow.close())
    }, [])

    const changePath = (e) => {
        setNowSelectedMenu(e)
        navigate(e.uri)
    }

    const goToGithub = () => {
        window.open(_package.homepage_url)
    }

    return (
        <div className="layout">
            <Box className="side-bar" role="presentation">
                <List>
                    <div className="side-bar-logo" onClick={() => goToGithub} title='帮忙点个star!!!'>
                        <div className='side-bar-logo-item'>
                            <img src={icon} height="60"></img>
                            <p className='go-github'>iptv-checker@{nowVersion}</p>
                        </div>
                    </div>
                    {
                        menuList.map((value, index) => (
                            value.showMod.includes(_mainContext.nowMod) ? (
                                <ListItem key={index} disablePadding onClick={() => changePath(value)}>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            {
                                                value.icon === 'SettingsIcon' ? <SettingsIcon /> : ''
                                            }
                                            {
                                                value.icon === 'AdjustIcon' ? <AdjustIcon /> : ''
                                            }
                                            {
                                                value.icon === 'PublicIcon' ? <PublicIcon /> : ''
                                            }
                                            {
                                                value.icon === 'CloudQueueIcon' ? <CloudQueueIcon /> : ''
                                            }
                                            {
                                                value.icon === 'RemoveRedEyeIcon' ? <RemoveRedEyeIcon /> : ''
                                            }
                                        </ListItemIcon>
                                        <ListItemText primary={t(value.name)} />
                                    </ListItemButton>
                                </ListItem>
                            ):''
                        ))}
                </List>
            </Box>
            <Box className="container-inner">
            <div data-tauri-drag-region class="titlebar">
                <div class="titlebar-button" id="titlebar-minimize">
                    <img
                    src="https://api.iconify.design/mdi:window-minimize.svg"
                    alt="minimize"
                    />
                </div>
                <div class="titlebar-button" id="titlebar-maximize">
                    <img
                    src="https://api.iconify.design/mdi:window-maximize.svg"
                    alt="maximize"
                    />
                </div>
                <div class="titlebar-button" id="titlebar-close">
                    <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
                </div>
            </div>
            {
                nowSelectedMenu.showHeader ? (
                    <>
                        <div style={{
                            fontSize: '40px',
                            padding: '50px 10px',
                            fontWeight: '600'
                        }}>{t(nowSelectedMenu.name)}</div>
                        <Divider style={{ marginBottom: '25px' }} />
                    </>
                ):''
            }
            <Outlet/>
            </Box>
        </div>
    )
}