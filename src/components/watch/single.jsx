import * as React from 'react';
import { useContext, useState, useEffect, useRef } from "react"
import VideoJS from './video'
import _Tabbar from './../layout/tabbar'
import { appWindow,WebviewWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";

export default function Single() {
    const [videoJsOptions, setVideoJsOptions] = useState(null)
    const setVideoOptions = (url) => {
        setVideoJsOptions({
            autoplay: true,
            controls: true,
            responsive: true,
            fluid: true,
            html5: {
                vhs: {
                    withCredentials: true,
                    overrideNative: true
                }
            },
            sources: [{
                src: url,
                type: 'application/x-mpegURL'
            }]
        })
    }
    const playerRef = React.useRef(null);
    const [m3u8Link, setM3u8Link] = useState('')
    const [httpHeaders, setHttpHeaders] = useState([])

    const listenEvent = async () => {
        const unlisten = await listen('changeWatchUrl', (event) => {
            // event.event 是事件名称 (当你想用一个回调函数处理不同类型的事件时很有用)
            // event.payload 是负载对象
            if(event.event === 'changeWatchUrl') {
                setM3u8Link(event.payload.data.url)
                onloadM3u8Link(event.payload.data.url)
            }
        })
    }

    useEffect(() => {
        let paramsObject = {};
        let list = new URLSearchParams(window.location.search).entries();
        for (let [key, value] of list) {
            paramsObject[key] = value;
        }
        if (paramsObject["url"] !== undefined) {
            setM3u8Link(paramsObject["url"])
            onloadM3u8Link(paramsObject["url"])
        }
        listenEvent()
    }, [])

    const onloadM3u8Link = (targetUrl) => {
        setVideoOptions(targetUrl)
        if(playerRef.current !== null) {
            playerRef.current.play()
        }
    }

    const handlePlayerReady = (player) => {
        console.log('load video')
        playerRef.current = player;
  
        // You can handle player events here, for example:
        player.on('waiting', () => {
            console.log('player is waiting');
        });
  
        player.on('dispose', () => {
            console.log('player will dispose');
        });
  
        player.on('fullscreen', (e) => {
          console.log('full s', e)
        })

        player.on('error', (e) => {
            console.log('error', e)
        })
  
        player.ready(function() {
          var fullScreenButton = player.controlBar.fullscreenToggle;
        
          fullScreenButton.on('click', function() {
            appWindow.setFullscreen(true).then(res => {
              console.log("set full screeen")
            });
          });
        });
    };

    return (
        <>
            <_Tabbar></_Tabbar>
            {
                videoJsOptions === null ? "" : (
                    <div style={{paddingTop: '30px'}}>
                        <VideoJS options={videoJsOptions} onReady={handlePlayerReady} headers={httpHeaders} />
                    </div>
                )
            }
        </>
    )
}