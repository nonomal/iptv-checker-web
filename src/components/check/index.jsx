import * as React from 'react';
import { useState, useContext, useEffect } from 'react'
import { MainContext } from './../../context/main';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import Divider from '@mui/material/Divider';
import CheckIcon from '@mui/icons-material/Check';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import utils from './../../utils/common'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { useTranslation, initReactI18next } from "react-i18next";

const lastHomeUserInput = 'lastHomeUserInput'

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Check() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const _mainContext = useContext(MainContext);
    const [body, setBody] = useState('')
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [showError, setShowError] = useState(false)

    useEffect(()=> {
        _mainContext.clearDetailData()
    }, [])

    const handleChangeContent = (e) => {
        setBody(e.target.value);
    }

    const handleCloseSnackBar = () => {
        setShowError(false)
    }

    const parseOnlineData = async (selectedUrl) => {
        let targetUrl = [];
        for (let i = 0; i < selectedUrl.length; i++) {
          for (let j = 0; j < selectedUrl[i].length; j++) {
            targetUrl.push(selectedUrl[i][j])
          }
        }
        console.log(targetUrl)
        let bodies = []
        if (targetUrl.length == 0) {
          return bodies
        }
        for (let i = 0; i < targetUrl.length; i++) {
          if (utils.isValidUrl(targetUrl[i])) {
            let res = await axios.get(_mainContext.getM3uBody(targetUrl[i]))
            if (res.status === 200) {
              bodies.push(res.data)
            }
          }
        }
        return bodies
      }

    const handleConfirm = async () => {
        setLoading(true);
        let bodyStr = body.trim()
        try {
            let bodyType = _mainContext.getBodyType(bodyStr)
            localStorage.setItem(lastHomeUserInput, bodyStr)
            if (bodyType === 2) {
                // 尝试解析url
                let targetUrlArr = bodyStr.split(",")
                let bodies = []
                if (targetUrlArr.length > 0) {
                    bodies = await parseOnlineData([targetUrlArr]);
                    _mainContext.changeOriginalM3uBody(bodies)
                }
            } else {
                _mainContext.changeOriginalM3uBody(bodyStr)
            }
            navigate("/detail")
        } catch (e) {
            setShowError(true)
            setErrorMsg(e.message)
            setLoading(false);
        }
    }

    return (
        <Box style={{
            padding: '0 20px',
        }}>
            <Snackbar open={showError} autoHideDuration={6000} onClose={handleCloseSnackBar}>
                <Alert onClose={handleCloseSnackBar} severity="error" sx={{ width: '100%' }}>
                    {errorMsg}
                </Alert>
            </Snackbar>
            <Box style={{ width: '700px' }}>
                <FormControl variant="standard">
                    <TextField style={{ width: '700px' }}
                        multiline id="standard-multiline-static"
                        rows={4} value={body} onChange={handleChangeContent} placeholder='请输入要检查的数据' />
                </FormControl>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '5px'
                }}>
                    <LoadingButton
                        size="small"
                        onClick={handleConfirm}
                        loading={loading}
                        variant="contained"
                        startIcon={<CheckIcon />}
                    >
                        下一步
                    </LoadingButton>
                </Box>
            </Box>
            <Box>
                输入框支持下面几种格式：
                <ul>
                    <li>支持标准格式的m3u链接，如有多个请用英文逗号做分割符,比如：<i>http://xxxx1.m3u,http://xxxx2.m3u</i></li>
                    <li>支持类似：<i>频道名称,http://xxxxx.m3u8</i> 格式</li>
                    <li>支持m3u文件原始内容，类似：<i>#EXTM3U xxxx</i></li>
                </ul>
            </Box>
        </Box>
    )
}