import * as React from 'react';
import { useEffect, useContext, useRef } from "react"
import { MainContext } from './../../context/main';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import axios from 'axios'
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import PublicIcon from '@mui/icons-material/Public';
import UploadIcon from '@mui/icons-material/Upload';
import AddIcon from '@mui/icons-material/Add';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Divider from '@mui/material/Divider';
import RefreshIcon from '@mui/icons-material/Refresh';
import { writeTextFile } from '@tauri-apps/api/fs';
import { save } from '@tauri-apps/api/dialog';
import { downloadDir } from '@tauri-apps/api/path';

const run_type_list = [{ "value": "EveryDay", "name": "每天" }, { "value": "EveryHour", "name": "每小时" }]
const output_folder = "static/output/"
const output_extenion = ".m3u"

const defaultValue = {
    "original": {
        "urls": [],
        "result_name": "",
        "md5": "",
        "run_type": "EveryDay",
        "keyword_dislike": [],
        "keyword_like": [],
        "http_timeout": 20000,
        "check_timeout": 20000,
        "concurrent": 30,
        "sort": false,
    },
    "id": "",
    "create_time": 0,
    "task_info": {
        "run_type": "EveryDay",
        "last_run_time": 0,
        "next_run_time": 0,
        "is_running": false,
        "task_status": "Pending"
    }
}

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            style={{ height: '400px' }}
            {...other}
        >
            {value === index && (
                <Typography>{children}</Typography>
            )}
        </div>
    );
}


function TaskForm(props) {
    const { onClose, formValue, open, onSave, handleSave, handleDelete } = props;
    const [task, setTask] = React.useState(defaultValue);
    const [filterKeyword, setFilterKeyword] = React.useState('')

    const [tabIndex, setTabIndex] = React.useState(0)

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleClose = () => {
        onClose();
    }

    const handleSaveClick = () => {
        handleSave(task)
        onClose();
    }

    const handleDeleteClick = () => {
        handleDelete(task)
        onClose();
    }

    const randomString = (len) => {
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        var maxPos = $chars.length;
        var pwd = '';
        for (let i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }

    useEffect(() => {
        if (formValue !== null) {
            formValue.original.result_name = formValue.original.result_name.replace(output_folder, "").replace(output_extenion, "")
            formValue.original.http_timeout = formValue.original.http_timeout ?? 0;
            formValue.original.check_timeout = formValue.original.check_timeout ?? 0;
            formValue.original.concurrent = formValue.original.concurrent ?? 0;
            formValue.original.sort = formValue.original.sort ?? false;
            setTask(formValue)
        } else {
            let default_data = JSON.parse(JSON.stringify(defaultValue))
            if (default_data.original.result_name == '') {
                default_data.original.result_name = randomString(10)
            }
            setTask(default_data)
        }
    }, [formValue]);

    const handleChangeRunType = (e) => {
        setTask({
            ...task,
            original: {
                ...task.original,
                run_type: e.target.value
            }
        });
    }

    const addNewM3uLink = () => {
        addNewM3uLinkByUrl("")
    }

    const addNewM3uLinkByUrl = (url) => {
        const newUrls = [...task.original.urls, url];
        setTask({
            ...task,
            original: {
                ...task.original,
                urls: newUrls
            }
        });
    }

    const handleDelRow = (passIndex) => {
        const newUrls = task.original.urls.filter((url, index) => index !== passIndex);
        setTask({
            ...task,
            original: {
                ...task.original,
                urls: newUrls,
            }
        });
    }

    const parseUrlId = (input_name) => {
        return parseInt(input_name.replace("url-", ""), 10)
    }

    const changeUrls = (e) => {
        const index = parseUrlId(e.target.name);
        const newUrls = [...task.original.urls]; // 创建urls数组的副本
        newUrls[index] = e.target.value; // 在指定索引处设置新的值

        const updatedTask = { ...task, original: { ...task.original, urls: newUrls } }; // 创建包含更新后的urls数组的新task对象
        setTask(updatedTask); // 设置更新后的task对象为新的状态值
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        axios.post('/media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(response => {
            addNewM3uLinkByUrl(response.data.url)
        }).catch(error => {
            console.error('上传失败', error);
        });
    }

    const changeResultName = (e) => {
        setTask({
            ...task,
            original: {
                ...task.original,
                result_name: e.target.value
            }
        });
    }

    const uniqueArr = (array) => {
        return array.filter((item, index) => array.indexOf(item) === index)
    }

    const addKeyword = (type) => {
        if (filterKeyword === '') {
            return
        }
        if (type === 1) {
            let kw = task.original.keyword_like ?? [];
            kw.push(filterKeyword)
            setTask({
                ...task,
                original: {
                    ...task.original,
                    keyword_like: uniqueArr(kw)
                }
            });
        } else if (type === 2) {
            let kw = task.original.keyword_dislike ?? [];
            kw.push(filterKeyword)
            setTask({
                ...task,
                original: {
                    ...task.original,
                    keyword_dislike: uniqueArr(kw)
                }
            });
        }
        setFilterKeyword("")
    }

    const changeFilterKeyword = (e) => {
        setFilterKeyword(e.target.value)
    }

    const deleteThisDislikeKw = (i) => {
        let kw = task.original.keyword_dislike;
        kw.splice(i, 1)
        setTask({
            ...task,
            original: {
                ...task.original,
                keyword_dislike: kw
            }
        });
    }

    const deleteThisLikeKw = (i) => {
        let kw = task.original.keyword_like??[];
        kw.splice(i, 1)
        setTask({
            ...task,
            original: {
                ...task.original,
                keyword_like: kw
            }
        });
    }

    const changeCheckTimeout = (e) => {
        setTask({
            ...task,
            original: {
                ...task.original,
                check_timeout: parseInt(e.target.value, 10)
            }
        });
    }

    const changeConcurrent = (e) => {
        setTask({
            ...task,
            original: {
                ...task.original,
                concurrent: parseInt(e.target.value, 10)
            }
        });
    }

    const changeHttpTimeout = (e) => {
        setTask({
            ...task,
            original: {
                ...task.original,
                http_timeout: parseInt(e.target.value, 10)
            }
        });
    }

    const handleChangeSortValue = (e) => {
        let checked = false
        if (e.target.defaultValue === "false") {
            checked = false
        } else {
            checked = true
        }
        setTask({
            ...task,
            original: {
                ...task.original,
                sort: checked
            }
        });
    }

    return (
        <Dialog onClose={handleClose} open={open}>
            <div style={{ padding: '40px', width: '500px' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabIndex} onChange={handleTabChange} aria-label="basic tabs example">
                        <Tab label="基础配置" />
                        <Tab label="个性化配置" />
                        <Tab label="系统配置" />
                        {
                            task.id !== '' ? (
                                <Tab label="运行状态" />
                            ) : ''
                        }
                    </Tabs>
                </Box>
                {
                    task.id !== '' ? (
                        <CustomTabPanel value={tabIndex} index={3}>
                            <div style={{ padding: "10px 0" }}>任务id：{task.id}</div>
                            <div style={{ padding: "10px 0" }}>运行状态：{task.task_info.task_status}</div>
                            <div style={{ padding: "10px 0" }}>创建时间：{task.create_time > 0 ? (new Date(task.create_time * 1000).toLocaleTimeString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false })) : ''}</div>
                            <div style={{ padding: "10px 0" }}>最后一次运行时间：{task.task_info.last_run_time > 0 ? (new Date(task.task_info.last_run_time * 1000).toLocaleTimeString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false })) : ''}</div>
                            <div style={{ padding: "10px 0" }}>下一次运行时间：{task.task_info.next_run_time > 0 ? (new Date(task.task_info.next_run_time * 1000).toLocaleTimeString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false })) : ''}</div>
                        </CustomTabPanel>
                    ) : ''
                }
                <CustomTabPanel value={tabIndex} index={0}>
                    <div>
                        {
                            task.original.urls.length > 0 ? (
                                <FormControl fullWidth style={{
                                    padding: "0 0 20px",
                                }}>
                                    <p id="demo-simple-select-standard-label">检查文件列表</p>
                                    {
                                        task.original.urls.map((value, index) => (
                                            <div style={{ display: 'flex' }} key={index}>
                                                <TextField style={{ width: '100%' }} disabled={value.startsWith("static")} id="standard-basic" variant="standard" name={"url-" + index} value={value} onChange={changeUrls} />
                                                <IconButton aria-label="delete" onClick={() => handleDelRow(index)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </div>
                                        ))
                                    }
                                </FormControl>
                            ) : ''
                        }
                        <FormControl fullWidth style={{
                            padding: "20px 0 20px", display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}>
                            <Button variant="outlined" onClick={() => addNewM3uLink()} startIcon={<PublicIcon />}>添加在线链接</Button>
                            <Button variant="contained" component="label" startIcon={<UploadIcon />}>
                                本地上传m3u文件
                                <input hidden accept="*" multiple type="file" onChange={handleFileUpload} />
                            </Button>
                        </FormControl>
                        <FormControl fullWidth style={{
                            margin: "0 0 20px",
                        }}>
                            <InputLabel id="demo-simple-select-standard-label">定时检查时间</InputLabel>
                            <Select
                                labelId="demo-simple-select-standard-label"
                                id="demo-simple-select-standard"
                                value={task.original.run_type}
                                label="定时检查时间"
                                onChange={handleChangeRunType}
                            >
                                {
                                    run_type_list.map((value, index) => (
                                        <MenuItem value={value.value} key={index}>{value.name}</MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                        <FormControl fullWidth style={{
                            margin: "20px 0 20px",
                        }}>
                            <InputLabel htmlFor="outlined-adornment-amount">结果文件名</InputLabel>
                            <OutlinedInput
                                style={{ width: '100%' }}
                                name="resultName"
                                endAdornment={<InputAdornment position="end">{output_extenion}</InputAdornment>}
                                startAdornment={<InputAdornment position="start">{output_folder}</InputAdornment>}
                                aria-describedby="outlined-weight-helper-text"
                                label="输出文件名"
                                value={task.original.result_name}
                                onChange={changeResultName}
                            />
                        </FormControl>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-around',
                            flexDirection: 'row-reverse'
                        }}>
                            <Button
                                variant="outlined"
                                style={{ marginRight: '20px' }}
                                onClick={handleSaveClick}
                                startIcon={<SaveIcon />}
                            >
                                保存
                            </Button>
                            {
                                task.id !== '' ? (
                                    <Button
                                        variant="outlined"
                                        style={{}}
                                        color="error"
                                        onClick={handleDeleteClick}
                                        startIcon={<DeleteIcon />}
                                    >删除</Button>
                                ) : ''
                            }
                        </div>
                    </div>
                </CustomTabPanel>
                <CustomTabPanel value={tabIndex} index={1}>
                    {
                        task.original.keyword_like !== null && task.original.keyword_like.length > 0 ? (
                            <FormControl fullWidth style={{
                                padding: "0 0 20px",
                            }}>
                                <FormLabel id="demo-row-radio-buttons-group-label">只看频道关键词</FormLabel>
                                <Stack direction="row" spacing={1}>
                                    {
                                        task.original.keyword_like !== null && task.original.keyword_like.map((value, i) => (
                                            <Chip
                                                label={value}
                                                onDelete={() => deleteThisLikeKw(i)}
                                                variant="outlined"
                                                key={i}
                                            />
                                        ))
                                    }
                                </Stack>
                            </FormControl>
                        ) : ''
                    }
                    {
                        task.original.keyword_dislike !== null && task.original.keyword_dislike.length > 0 ? (
                            <FormControl fullWidth style={{
                                padding: "0 0 20px",
                            }}>
                                <FormLabel id="demo-row-radio-buttons-group-label">不看频道关键词</FormLabel>
                                <Stack direction="row" spacing={1}>
                                    {
                                        task.original.keyword_dislike.map((value, i) => (
                                            <Chip
                                                label={value}
                                                variant="outlined"
                                                onDelete={() => deleteThisDislikeKw(i)}
                                                key={i}
                                            />
                                        ))
                                    }
                                </Stack>
                            </FormControl>
                        ) : ''
                    }
                    <FormControl fullWidth style={{
                        margin: "20px 0 20px",
                    }}>
                        <Stack direction="row" spacing={1}>
                            <TextField
                                id="standard-basic"
                                label="添加关键词"
                                variant="standard"
                                value={filterKeyword} onChange={changeFilterKeyword} />
                            <Button
                                size='small'
                                variant="outlined"
                                onClick={() => addKeyword(1)}
                                startIcon={<InsertEmoticonIcon />}
                            >添加只看</Button>
                            <Button
                                size='small'
                                variant="outlined"
                                onClick={() => addKeyword(2)}
                                startIcon={<MoodBadIcon />}>添加不看</Button>
                        </Stack>
                    </FormControl>
                    <FormControl>
                        <FormLabel id="demo-row-radio-buttons-group-label">是否需要排序</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="row-radio-buttons-group"
                            value={task.original.sort}
                            onChange={handleChangeSortValue}
                        >
                            <FormControlLabel value="false" control={<Radio />} label="否" />
                            <FormControlLabel value="true" control={<Radio />} label="是" />
                        </RadioGroup>
                    </FormControl>
                </CustomTabPanel>
                <CustomTabPanel value={tabIndex} index={2}>
                    <FormControl fullWidth style={{
                        margin: "20px 0 20px",
                    }}>
                        <FormLabel id="demo-row-radio-buttons-group-label">http超时(毫秒ms)</FormLabel>
                        <TextField id="standard-basic" variant="standard" value={task.original.http_timeout} onChange={changeHttpTimeout} />
                    </FormControl>
                    <FormControl fullWidth style={{
                        margin: "20px 0 20px",
                    }}>
                        <FormLabel id="demo-row-radio-buttons-group-label">检查超时(毫秒ms)</FormLabel>
                        <TextField id="standard-basic" variant="standard" value={task.original.check_timeout} onChange={changeCheckTimeout} />
                    </FormControl>
                    <FormControl fullWidth style={{
                        margin: "20px 0 20px",
                    }}>
                        <FormLabel id="demo-row-radio-buttons-group-label">检查并发数</FormLabel>
                        <TextField id="standard-basic" variant="standard" value={task.original.concurrent} onChange={changeConcurrent} />
                    </FormControl>
                </CustomTabPanel>
            </div>
        </Dialog>
    );
}

function Row(props) {
    const { row, clickTask, doTaskRightNow, showDownloadDialog } = props;
    const [open, setOpen] = React.useState(false);

    const handleTaskRightNow = (id) => {
        doTaskRightNow(id)
    }

    const openDownloadDialog = (id) => {
        showDownloadDialog(id)
    }

    return (
        <React.Fragment>
            <TableRow sx={{ minWidth: 1024 }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                    {
                        row.task_info.next_run_time > 0 && row.task_info.next_run_time - new Date().getTime() / 1000 >= 180
                            && row.task_info.last_run_time > 0 && new Date().getTime() / 1000 - row.task_info.last_run_time >= 180 ? (
                            <Button onClick={() => handleTaskRightNow(row.id)}>立即执行</Button>
                        ) : ''
                    }
                </TableCell>
                <TableCell component="th" scope="row" onClick={() => clickTask()}>
                    {row.id}
                </TableCell>
                <TableCell>
                    <Tooltip title={row.original.result_name}>
                        <div onClick={() => openDownloadDialog(row.id)}>
                            {row.original.result_name}
                        </div>
                    </Tooltip>
                </TableCell>
                <TableCell align="right">
                    <div>创建时间：{row.create_time > 0 ? (new Date(row.create_time * 1000).toLocaleTimeString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false })) : ''} </div>
                    <div>最后一次运行时间：{row.task_info.last_run_time > 0 ? (new Date(row.task_info.last_run_time * 1000).toLocaleTimeString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false })) : ''} </div>
                    <div>下一次运行时间：{row.task_info.next_run_time > 0 ? (new Date(row.task_info.next_run_time * 1000).toLocaleTimeString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false })) : ''} </div>
                    <div>运行类型：{row.task_info.run_type} </div>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box>
                            <Table size="small" aria-label="purchases">
                                {row.original.urls.map((historyRow) => (
                                    <TableRow key={historyRow}>
                                        <TableCell component="th" scope="row">
                                            {historyRow}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {
                                    row.original.keyword_dislike !== null ? (
                                        <TableRow key="dislike-row">
                                            <TableCell component="th" scope="row">
                                                不喜欢关键词：{row.original.keyword_dislike?row.original.keyword_dislike.join("、"):''}
                                            </TableCell>
                                        </TableRow>
                                    ) : ''
                                }
                                {
                                    row.original.keyword_like !== null ? (
                                        <TableRow key="like-row">
                                            <TableCell component="th" scope="row">
                                                喜欢关键词：{row.original.keyword_like?row.original.keyword_like.join("、"):''}
                                            </TableCell>
                                        </TableRow>
                                    ) : ''
                                }
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

function DownloadDialog(props) {
    const { onClose, formValue, open } = props;

    const [showData, setShowData] = React.useState([])
    const [url, setUrl] = React.useState('')

    const handleClose = () => {
        onClose(false);
    };

    useEffect(() => {
        setUrl(window.document.location.origin + "/" + formValue.url)
        if (formValue.content !== '') {
            setShowData(formValue.content.split("\n"))
        } else {
            setShowData([])
        }
    }, [formValue])

    const downloadFile = async() => {
        // window.open(url)
        const downloadDirPath = await downloadDir();
        let download_name = downloadDirPath + 'iptv-checker-file-'+new Date().getTime()+".m3u"
        const filePath = await save({
            defaultPath: download_name,
            filters: [{
              name: download_name,
              extensions: ['m3u']
            }]
        });
        filePath && await writeTextFile(download_name, formValue.content)
    }

    return (
        <Dialog onClose={handleClose} open={open}>
            <div style={{
                width: '960px',
                minHeight: '400px'
            }}>
                <div style={{
                    overflow: 'hidden',
                    padding: '0 20px'
                }}>
                    <div style={{
                        position: 'fixed',
                        overflow: 'hidden',
                        backgroundColor: '#fff',
                        zIndex: 9,
                        width: '560px',
                    }}>
                        <div>订阅链接：<b>{url}</b></div>
                        {
                            showData.length > 0 ? (
                                <div>
                                    <Button variant="text" onClick={() => downloadFile(formValue.url)}>点击下载</Button>
                                </div>
                            ) : ''
                        }

                    </div>
                    {
                        showData.length > 0 ? (
                            <div style={{
                                padding: "60px 0",
                                position: 'relative',
                                textWrap: "nowrap"
                            }}>
                                {
                                    showData.map((value, index) => (
                                        <div key={index}>{value}</div>
                                    ))
                                }
                            </div>
                        ) : (
                            <div style={{ padding: "60px 0", position: 'relative' }}>
                                <div>暂未生成</div>
                            </div>
                        )
                    }
                </div>
            </div>
        </Dialog>
    );
}

export default function TaskList(props) {
    const _mainContext = useContext(MainContext);

    const privateHostRef = useRef("")

    useEffect(() => {
        let config = _mainContext.settings
        if(config !== null) {
            if(config.privateHost !== '') {
                setPrivateHost(config.privateHost)
                privateHostRef.current = config.privateHost
                get_task_list()
            }
        }
    }, [_mainContext])

    const [formDialog, setFormDialog] = React.useState(false);
    const [formValue, setFormValue] = React.useState(null);
    const [taskList, setTaskList] = React.useState([])
    const [selectedIndex, setSelectedIndex] = React.useState(-1)
    const [openAlertBar, setOpenAlertBar] = React.useState(false)
    const [alertBarMsg, setAlertBarMsg] = React.useState("")
    const [openDownloadBody, setOpenDownloadBody] = React.useState(false)
    const [downloadBody, setDownloadBody] = React.useState({ "content": "", "url": "" })
    const [privateHost, setPrivateHost] = React.useState('')

    // useEffect(() => {
    //     get_task_list()
    // }, [privateHost]);

    const handleClickOpen = (value) => {
        setFormValue(value)
        setFormDialog(true);
    };

    const handleClose = (value) => {
        setFormDialog(false);
        setSelectedIndex(-1)
        setFormValue(null)
    };

    const handleSave = (value) => {
        if (value.id === '') {
            task_add(value)
        } else {
            update_task(value)
        }
    }

    const getTaskSaveData = (value) => {
        return {
            "urls": value.original.urls,
            "result_name": output_folder + value.original.result_name + output_extenion,
            "md5": "",
            "run_type": value.original.run_type,
            "keyword_dislike": value.original.keyword_dislike,
            "keyword_like": value.original.keyword_like,
            "http_timeout": value.original.http_timeout,
            "check_timeout": value.original.check_timeout,
            "sort": value.original.sort,
            "concurrent": value.original.concurrent,
        }
    }

    const update_task = (value) => {
        axios.post(getHost() + "/tasks/update?task_id=" + value.id, getTaskSaveData(value)).then(res => {
            if (res.data.code === "200") {
                get_task_list()
            } else {
                throw new Error(res.data.msg)
            }
        }).catch(e => {
            handleOpenAlertBar(e.message)
        })
    }

    const getHost = () => {
        return privateHostRef.current
    }

    const task_add = (value) => {
        axios.post(getHost()+"/tasks/add", getTaskSaveData(value)).then(res => {
            if (res.data.code === "200") {
                get_task_list()
            } else {
                throw new Error(res.data.msg)
            }
        }).catch(e => {
            handleOpenAlertBar(e.message)
        })
    }

    const handleDelete = (value) => {
        axios.delete(getHost()+"/tasks/delete/" + value.id).then(res => {
            if (res.data.code === "200") {
                get_task_list()
            } else {
                throw new Error(res.data.msg)
            }
        }).catch(e => {
            handleOpenAlertBar(e.message)
        })
    }

    const get_task_list = () => {
        let url = getHost()+"/tasks/list?page=1"
        console.log(url)
        axios.get(url).then(res => {
            setTaskList(res.data.list)
        }).catch(e => {
            setTaskList([])
            handleOpenAlertBar("获取任务失败，请检查服务是否正常启动")
        })
    }

    const handleOpenAlertBar = (msg) => {
        setAlertBarMsg(msg)
        setOpenAlertBar(true)
    }

    const handleCloseAlertBar = () => {
        setAlertBarMsg("")
        setOpenAlertBar(false)
    }

    const doTaskRightNow = (id) => {
        axios.get(getHost()+"/tasks/run?task_id=" + id).then(res => {
            get_task_list()
        }).catch(e => {
            handleOpenAlertBar("操作失败")
        })
    }

    const getDownloadBody = (id) => {
        axios.get(getHost()+"/tasks/get-download-body?task_id=" + id).then(res => {
            setOpenDownloadBody(true)
            setDownloadBody({ 'content': res.data.content, "url": res.data.url })
        }).catch(e => {
            handleOpenAlertBar("操作失败")
        })
    }

    const handleDownloadClose = (val) => {
        setOpenDownloadBody(val)
    }

    const refreshList = () => {
        setTaskList([])
        get_task_list()
    }

    return (
        <Box style={{padding: '0 20px'}}>
            <div style={{ fontSize: '40px',
                padding: '50px 10px',
                fontWeight: '600' }}>定时检查任务</div>
            <Divider style={{ marginBottom: '25px' }} />
            {
                privateHost ? (
            <>
            <Box style={{marginBottom: '10px'}}>
                <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => handleClickOpen(null)}
                style={{marginRight: '10px'}}
                >新增</Button>
                <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />} 
                onClick={() => refreshList()}
                >刷新列表</Button>
            </Box>
            <Snackbar
                open={openAlertBar}
                autoHideDuration={6000}
                onClose={handleCloseAlertBar}
                message={alertBarMsg}
            />
            <TaskForm
                formValue={JSON.parse(JSON.stringify(formValue))}
                open={formDialog}
                onClose={handleClose}
                handleSave={handleSave}
                handleDelete={handleDelete}
            />
            <DownloadDialog
                formValue={downloadBody}
                open={openDownloadBody}
                onClose={() => handleDownloadClose(false)}
            />
            <p>当前设置的【后台检查server域名】为：{privateHost}</p>
            <Paper sx={{ width: '1024px', overflow: 'hidden' }}>
                <TableContainer>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>任务id</TableCell>
                            <TableCell>输出文件</TableCell>
                            <TableCell align="right">其他</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            taskList.map((row) => (
                                <Row
                                    key={row.id}
                                    row={row}
                                    doTaskRightNow={doTaskRightNow}
                                    showDownloadDialog={getDownloadBody}
                                    clickTask={() => handleClickOpen(row)}
                                />
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            </Paper>
            </>
            ):(
                <Box>对不起，您没有设置【后台检查server域名】，请至设置页面操作后再来查看</Box>
            )}
        </Box>
    );
}