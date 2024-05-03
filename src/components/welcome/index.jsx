import * as React from 'react';
import { useEffect } from "react"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import LoadingButton from '@mui/lab/LoadingButton';
import { MainContext } from './../../context/main';
import axios from 'axios'
import Tooltip from '@mui/material/Tooltip';
import CheckIcon from '@mui/icons-material/Check';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import CountryJson from './../../assets/api/country.json'
import WatchJson from './../../assets/api/watch.json'
import Button from '@mui/material/Button';
import ParseM3u from './../../utils/utils'
import { useNavigate } from 'react-router-dom';
import _package from './../../../package';
import LogoSvg from './../../assets/iptv-checker.svg'
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import utils from './../../utils/common'
import TaskListView from './task';
import GitHubIcon from '@mui/icons-material/GitHub';

const ModSmartInput = 0
const ModPublicSource = 1
const ModUploadFromLocal = 2
const TaskList = 3
const SystemInfo = 4

let selectOptionWithNoWatch = [
  { 'mod': ModSmartInput, "name": "智能识别框" },
  { 'mod': ModPublicSource, "name": "公共订阅源" },
  { 'mod': ModUploadFromLocal, "name": "本地上传" },
  { 'mod': TaskList, "name": "定时任务" },
  { 'mod': SystemInfo, "name": "系统信息" },
]

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const nowVersion = _package.version;

const githubLink = _package.homepage_url
const copyright = _package.author

const boxMaxWith = 680

const oneFrame = {
  marginBottom: '10px',
  width: boxMaxWith + "px",
  display: 'flex',
  justifyContent: 'flex-end',
  flexDirection: 'column'
}

function TabPanel(props) {
  const { children, mod, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={mod !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {mod === index && (
        <Box style={{ marginTop: "2px" }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  mod: PropTypes.number.isRequired,
};

const lastHomeTab = 'lastHomeTab'
const lastHomeUserInput = 'lastHomeUserInput'

export default function HorizontalLinearStepper() {

  const navigate = useNavigate();
  const _mainContext = React.useContext(MainContext);
  const [commonLinks, setCommonLink] = React.useState([]);
  const [mod, setMod] = React.useState(ModSmartInput);
  const [body, setBody] = React.useState('');
  const [selectedUrl, setSelectedUrl] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('')
  const [showError, setShowError] = React.useState(false)
  const [watchList, setWatchList] = React.useState([])
  const [localFileName, setLocalFileName] = React.useState('')
  const [systemInfo, setSystemInfo] = React.useState(null)

  useEffect(() => {
    system_info()
    fetchCommonLink()
    _mainContext.clearDetailData()
    fetchWatchOnlineData()
    let _tab = localStorage.getItem(lastHomeTab)
    if (_tab !== '' && _tab !== null) {
      let _tabInt = parseInt(_tab, 10)
      setMod(_tabInt)
      let userInput = localStorage.getItem(lastHomeUserInput)
      if (userInput !== '' && userInput !== null) {
        setBody(userInput)
      }
    }
  }, [])

  const getTabs = () => {
    return selectOptionWithNoWatch
  }

  const fetchWatchOnlineData = async () => {
    let list = []
    for (let i = 0; i < WatchJson.length; i++) {
      if (WatchJson[i].raw !== '') {
        let _body = decodeURIComponent(atob(WatchJson[i].raw))
        let _data = ParseM3u.parseOriginalBodyToList(_body)
        list.push({
          name: WatchJson[i].name,
          list: _data
        })
      }
    }
    setWatchList(list)
  }

  const fetchCommonLink = async () => {
    setCommonLink(CountryJson)
  }

  const handleChangeContent = (e) => {
    setBody(e.target.value);
  }

  const handleSelectedCountry = (e) => {
    setSelectedUrl(e.target.value)
  }

  const system_info = () => {
    axios.get("/system/info").then(res => {
      setSystemInfo(res.data)
    }).catch(e => {
      setShowError(true)
      setErrorMsg("后端服务异常，请检查")
    });
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

  const handleConfirm = async (e) => {
    setLoading(true);
    try {
      if (mod === ModPublicSource) {
        localStorage.removeItem(lastHomeUserInput)
        let bodies = await parseOnlineData(selectedUrl);
        if (bodies.length === 0) {
          throw new Error('链接为空')
        }
        _mainContext.changeOriginalM3uBodies(bodies)
      } else if (mod === ModSmartInput) {
        if (body !== '') {
          localStorage.setItem(lastHomeUserInput, body)
          // 尝试解析url
          let targetUrlArr = body.split(",")
          let bodies = []
          if (targetUrlArr.length > 0) {
            bodies = await parseOnlineData([targetUrlArr]);
          }
          if (bodies.length > 0) {
            _mainContext.changeOriginalM3uBody(bodies)
          }
          // 再尝试解析body
          if (bodies.length === 0) {
            _mainContext.changeOriginalM3uBody(body)
          }
        } else {
          throw new Error('数据为空')
        }
      } else if (mod == ModUploadFromLocal) {
        if (body !== '') {
          _mainContext.changeOriginalM3uBody(body)
        } else {
          throw new Error('获取数据失败')
        }
      }
      navigate("/detail")
    } catch (e) {
      setShowError(true)
      setErrorMsg(e.message)
    }
    setLoading(false)
  }

  const handleCloseSnackBar = () => {
    setShowError(false)
  }

  const goToWatchPage = async (val) => {
    let query = {}
    if (val !== null) {
      query.original = encodeURIComponent(val.raw)
    }
    navigate("/watch", {
      state: query,
    })
  }

  const handleTabChange = (event, newValue) => {
    setMod(newValue);
    localStorage.setItem(lastHomeTab, newValue)
  };

  const HandleLocalUpload = (e) => {
    const file = new FileReader();
    setLocalFileName(e.target.value)
    file.readAsText(e.target.files[0])
    file.onload = (e) => {
      setBody(e.target.result)
    }
  }

  const openLink = (url) => {
    window.open(url)
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '100px',
    }}>
      <Snackbar open={showError} autoHideDuration={6000} onClose={handleCloseSnackBar}>
        <Alert onClose={handleCloseSnackBar} severity="error" sx={{ width: '100%' }}>
          {errorMsg}
        </Alert>
      </Snackbar>
      <img src={LogoSvg} height="70" style={{ backgroundColor: "#fff", borderRadius: '20px' }} />
      <h1 style={{ fontSize: '30px' }}>IPTV Checker</h1>
      <Tooltip title="❤️❤️❤️帮忙点个star，万分感谢！！！❤️❤️❤️" placement="top">
        <Button onClick={() => openLink(githubLink)} startIcon={<GitHubIcon />}>
          {copyright}
        </Button>
      </Tooltip>
      <Box sx={oneFrame}>
        <Box >
          <Tabs value={mod} onChange={handleTabChange} aria-label="basic tabs example">
            {
              getTabs().map((value, index) => (
                <Tab label={value.name} key={index} />
              ))
            }
          </Tabs>
        </Box>
        <TabPanel mod={mod} index={ModSmartInput}>
          <FormControl sx={{ width: boxMaxWith }} variant="standard">
            <TextField multiline id="standard-multiline-static" rows={4} value={body} onChange={handleChangeContent} placeholder='多个链接请用英文逗号","分隔,支持标准m3u链接以及文件内容为多行的[名称,url]的链接地址格式、支持标准m3u文件格式以及文件内容为多行的[名称,url]的内容格式' />
          </FormControl>
        </TabPanel>
        <TabPanel mod={mod} index={ModPublicSource}>
          <FormControl sx={{ width: boxMaxWith }}>
            <InputLabel id="demo-simple-select-label" sx={{ width: boxMaxWith + 10 }}>country</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              multiple
              value={selectedUrl}
              label="country"
              onChange={handleSelectedCountry}
            >
              {
                commonLinks.map((value, index) => (
                  <MenuItem value={value.url} key={index}>{value.country}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </TabPanel>
        <TabPanel mod={mod} index={ModUploadFromLocal}>
          <Button variant="contained" component="label">
            {localFileName === '' ? 'Upload' : localFileName}
            <input hidden type="file" onChange={HandleLocalUpload} />
          </Button>
        </TabPanel>
        <TabPanel mod={mod} index={TaskList}>
          <TaskListView></TaskListView>
        </TabPanel>
        <TabPanel mod={mod} index={SystemInfo}>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '16px' }}>
            <span >当前{
              systemInfo !== null ? (
                systemInfo.can_ipv6 ? '支持' : (
                  <span style={{ color: 'red', fontWeight: 'bold', fontSize: 20 }}>不支持</span>
                )
              ) : '后端服务未启动，暂不清楚是否支持'
            }IPV6
              {
                systemInfo !== null && !systemInfo.can_ipv6 ? (
                  '(需要您的网络环境支持才可以检测IPV6源！！！)'
                ) : ''
              }
            </span>
            <span >前端版本号:{nowVersion}</span>
            <span >后端版本号:{systemInfo !== null ? systemInfo.version : '未知'}</span>
          </div>
        </TabPanel>
        {
          (mod !== TaskList && mod !== SystemInfo) ? (
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
          ) : ''
        }
      </Box>
    </Box>
  );
}