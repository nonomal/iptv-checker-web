import * as React from 'react';
import { useEffect, useState, useContext } from "react"
import { useNavigate } from 'react-router-dom';
import { Outlet } from "react-router-dom";
import './menu.css'
import { MainContext } from './../../context/main';
import icon from './../../assets/icon.png';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import SettingsIcon from '@mui/icons-material/Settings';
import AdjustIcon from '@mui/icons-material/Adjust';
import PublicIcon from '@mui/icons-material/Public';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import _package from './../../../package';

let menuList = [{
    "name": "检测源",
    "uri": "/check",
    "icon": "AdjustIcon",
    'showMod':[0,1]
}, {
    "name": "公共订阅源",
    "uri": "/public",
    "icon": "PublicIcon",
    'showMod':[0,1]
},{
    "name": "在线观看",
    "uri": "/watch",
    "icon": "RemoveRedEyeIcon",
    'showMod':[1]
}, {
    "name": "定时检查任务",
    "uri": "/task",
    "icon": "CloudQueueIcon",
    'showMod':[0]
}, {
    "name": "系统设置",
    "uri": "/settings",
    "icon": "SettingsIcon",
    'showMod':[0,1]
}]

export default function Layout() {
    const _mainContext = useContext(MainContext);
    const navigate = useNavigate();

    const nowVersion = _package.version;

    const changePath = (e) => {
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
                                        <ListItemText primary={value.name} />
                                    </ListItemButton>
                                </ListItem>
                            ):''
                        ))}
                </List>
            </Box>
            <Box className="container-inner">
                <Outlet/>
            </Box>
        </div>
    )
}