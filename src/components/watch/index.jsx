import * as React from 'react';
import { useContext, useState, useEffect, useRef } from "react"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import LoadingButton from '@mui/lab/LoadingButton';
import { MainContext } from './../../context/main';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import VideoSettingsIcon from '@mui/icons-material/VideoSettings';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import ParseM3u from '../../utils/utils'
import { useLocation } from 'react-router-dom';
import VideoJS from './video'
import Divider from '@mui/material/Divider';

export default function Watch() {
    const _mainContext = useContext(MainContext);
    const location = useLocation();
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
    const [name, setName] = useState('')
    const [logoUrl, setLogoUrl] = useState('')
    const [m3u8Link, setM3u8Link] = useState('')
    const [isPlaying, setIsPlaying] = useState(false)
    const [httpHeaders, setHttpHeaders] = useState([])

    useEffect(() => {
        let paramsObject = {};
        let list = new URLSearchParams(window.location.search).entries();
        for (let [key, value] of list) {
            paramsObject[key] = value;
        }
        if (paramsObject["url"] !== undefined) {
            setM3u8Link(paramsObject["url"])
            onloadM3u8Link()
        }
        // alert(location)
        // let location = window.location;
        // let originalParams = location.state.original
        // if (originalParams === null || originalParams === undefined) {
        // setOpen(true)
        // } else {
        //     let original = decodeURIComponent(originalParams)
        //     let parseData = ParseM3u.parseOneM3uData(original)
        //     if (parseData && parseData.exist) {
        //         setName(parseData.name)
        //         setLogoUrl(parseData.logoUrl)
        //         iniotM3u8Link(parseData.url)
        //         setHttpHeaders(parseData.copt)
        //     } else {
        //         setOpen(true)
        //     }
        // }
    }, [])

    const changeM3u8Link = (e) => {
        setM3u8Link(e.target.value)
    }

    const onloadM3u8Link = () => {
        setVideoOptions(m3u8Link)
    }

    const stopLoadM3u8Link = () => {
        destroyVideo()
    }

    const destroyVideo = () => {
        setIsPlaying(false)
    }

    const onChangeHttpHeaderKey = (val, index, e) => {
        setHttpHeaders(prev =>
            prev.map((item, idx) => idx === index ? { ...item, key: e.target.value } : item)
        )
    }

    const onChangeHttpHeaderValue = (val, index, e) => {
        setHttpHeaders(prev =>
            prev.map((item, idx) => idx === index ? { ...item, value: e.target.value } : item)
        )
    }

    const deleteThisHeader = (index) => {
        setHttpHeaders(prev =>
            prev.filter((item, idx) => idx !== index)
        )
    }

    const addNewHttpHeader = () => {
        setHttpHeaders([...httpHeaders, { key: '', value: '' }])
    }

    const playerRef = React.useRef(null);

    const handlePlayerReady = (player) => {
        playerRef.current = player;

        // You can handle player events here, for example:
        player.on('waiting', () => {
            console.log('player is waiting');
        });

        player.on('dispose', () => {
            console.log('player will dispose');
        });
    };

    return (
        <Box style={{
            padding: '0 20px'
        }}>
            <div style={{
                fontSize: '40px',
                padding: '50px 10px',
                fontWeight: '600'
            }}>在线观看</div>
            <Divider style={{ marginBottom: '25px' }} />
            <Box style={{
                display: 'flex',
                alignItems: 'center'
            }}>
                <FormControl sx={{ width: 550, margin: '10px' }}>
                    <TextField sx={{ fontSize: '11px' }} label='请输入m3u8播放地址' size="small" id="standard-multiline-static" value={m3u8Link} onChange={changeM3u8Link} />
                </FormControl>
                {
                    m3u8Link !== '' && !isPlaying ? (
                        <LoadingButton
                            size="small"
                            onClick={onloadM3u8Link}
                            variant="contained"
                            startIcon={<PlayCircleOutlineIcon />}
                        >
                            播放
                        </LoadingButton>
                    ) : ''}
                {
                    m3u8Link !== '' && isPlaying ? (
                        <LoadingButton
                            size="small"
                            onClick={stopLoadM3u8Link}
                            variant="contained"
                            startIcon={<StopCircleIcon />}
                        >
                            停止
                        </LoadingButton>
                    ) : ''
                }
            </Box>
            <Box>
                <FormControl sx={{ width: 550, margin: '10px' }}>
                    <Box sx={{ marginBottom: "10px" }}>
                        <Button
                            size="small"
                            onClick={addNewHttpHeader}
                            variant="contained"
                        >
                            + http Header
                        </Button>
                    </Box>
                    {
                        httpHeaders.map((value, index) => (
                            <Box key={index} sx={{ marginBottom: "10px", display: 'flex', alignItems: 'center' }}>
                                <TextField sx={{ fontSize: '11px', marginRight: '5px' }} label='key' size="small" id="standard-multiline-static" value={value.key} onChange={onChangeHttpHeaderKey.bind(this, value, index)} />
                                <TextField sx={{ fontSize: '11px' }} label='value' size="small" id="standard-multiline-static" value={value.value} onChange={onChangeHttpHeaderValue.bind(this, value, index)} />
                                <DeleteIcon color="disabled" onClick={() => deleteThisHeader(index)} />
                            </Box>
                        ))
                    }
                </FormControl>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ marginLeft: "10px" }}>
                        {logoUrl !== '' ? (
                            <img src={logoUrl} height="50"></img>
                        ) : ''}
                    </Box>
                    <h2 style={{
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        {name}
                        {/* {
                            m3u8Link !== '' && !isPlaying ? (
                                <LoadingButton
                                    size="small"
                                    onClick={onloadM3u8Link}
                                    variant="contained"
                                    startIcon={<PlayCircleOutlineIcon />}
                                >
                                    播放
                                </LoadingButton>
                            ) : ''}
                        {
                            m3u8Link !== '' && isPlaying ? (
                                <LoadingButton
                                    size="small"
                                    onClick={stopLoadM3u8Link}
                                    variant="contained"
                                    startIcon={<StopCircleIcon />}
                                >
                                    停止
                                </LoadingButton>
                            ) : ''
                        } */}
                    </h2>
                </Box>
                <FormControl sx={{ margin: '10px' }}>
                    {
                        videoJsOptions === null ? "" : (
                            <VideoJS options={videoJsOptions} onReady={handlePlayerReady} headers={httpHeaders} />
                        )
                    }
                </FormControl>
            </Box>
        </Box>
    )
}