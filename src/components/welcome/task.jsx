import * as React from 'react';
import { useEffect } from "react"
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
import FormHelperText from '@mui/material/FormHelperText';
import Snackbar from '@mui/material/Snackbar';
import Divider from '@mui/material/Divider';

const run_type_list = [{ "value": "EveryDay", "name": "每天" }, { "value": "EveryHour", "name": "每小时" }]

const defaultValue = {
    "original": {
        "urls": [],
        "contents": "",
        "result_name": "",
        "md5": ""
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

function TaskForm(props) {
    const { onClose, formValue, open, onSave, handleSave, handleDelete } = props;
    const [task, setTask] = React.useState(defaultValue);

    const handleClose = () => {
        onClose();
    };

    const handleSaveClick = () => {
        // let saveTask = JSON.parse(JSON.stringify(task));
        // saveTask.original.result_name = 'static/'+saveTask.original.result_name+".m3u"
        handleSave(task)
        onClose();
    };

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
            task_info: {
                ...task.task_info,
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
                urls: newUrls
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

    return (
        <Dialog onClose={handleClose} open={open}>
            <div style={{ padding: '40px', width: '500px' }}>
                {
                    task.id === '' ? (
                        <div>
                            <FormControl fullWidth style={{
                                padding: "0 0 20px",
                            }}>
                                <InputLabel htmlFor="outlined-adornment-amount">结果文件名</InputLabel>
                                <OutlinedInput
                                    style={{ width: '100%' }}
                                    name="resultName"
                                    endAdornment={<InputAdornment position="end">.m3u</InputAdornment>}
                                    startAdornment={<InputAdornment position="start">static/</InputAdornment>}
                                    aria-describedby="outlined-weight-helper-text"
                                    label="输出文件名"
                                    value={task.original.result_name}
                                    onChange={changeResultName}
                                />
                            </FormControl>
                            <Divider />
                            <FormControl fullWidth style={{
                                padding: "0 0 20px",
                            }}>
                                检查文件列表
                            </FormControl>
                            <FormControl fullWidth style={{
                                padding: "0 0 20px",
                            }}>
                                {
                                    task.original.urls.map((value, index) => (
                                        <div style={{ display: 'flex' }} key={index}>
                                            <TextField style={{ width: '100%' }} id="standard-basic" variant="standard" name={"url-" + index} value={value} onChange={changeUrls} />
                                            <Button variant="text" onClick={() => handleDelRow(index)}>删除</Button>
                                        </div>
                                    ))
                                }
                            </FormControl>
                            <FormControl fullWidth style={{
                                padding: "0 0 20px", display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between'
                            }}>
                                <Button variant="outlined" onClick={() => addNewM3uLink()}>添加在线链接</Button>
                                <Button variant="contained" component="label">
                                    本地上传m3u文件
                                    <input hidden accept="image/*" multiple type="file" onChange={handleFileUpload} />
                                </Button>
                            </FormControl>
                            <Divider />
                            <FormControl fullWidth style={{
                                padding: "0 0 20px",
                            }}>
                                定时检查时间
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-standard-label">运行类型</InputLabel>
                                <Select
                                    labelId="demo-simple-select-standard-label"
                                    id="demo-simple-select-standard"
                                    value={task.task_info.run_type}
                                    label="运行类型"
                                    onChange={handleChangeRunType}
                                >
                                    {
                                        run_type_list.map((value, index) => (
                                            <MenuItem value={value.value} key={index}>{value.name}</MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                        </div>
                    ) : ''}
                {
                    task.id !== '' ? (
                        <div style={{ padding: "10px 0" }}>
                            <div style={{ padding: "10px 0" }}>任务id：{task.id}</div>
                            <div style={{ padding: "10px 0" }}>输出文件名：{task.original.result_name}</div>
                            <div style={{ padding: "10px 0" }}>
                                <div>检查文件列表</div>
                                {
                                    task.original.urls.map(value => (
                                        <div>{value}</div>
                                    ))
                                }
                            </div>
                            <div style={{ padding: "10px 0" }}>运行状态：{task.task_info.task_status}</div>
                            <div style={{ padding: "10px 0" }}>创建时间：{task.create_time}</div>
                            <div style={{ padding: "10px 0" }}>最后一次运行时间：{task.task_info.last_run_time}</div>
                            <div style={{ padding: "10px 0" }}>下一次运行时间：{task.task_info.next_run_time}</div>
                        </div>
                    ) : ''
                }
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around'
                }}>
                    {
                        task.id === '' ? (
                            <Button variant="text" onClick={handleSaveClick}>保存</Button>
                        ) : ''
                    }
                    {
                        task.id !== '' ? (
                            <Button variant="text" color="error" onClick={handleDeleteClick}>删除</Button>
                        ) : ''
                    }
                </div>
            </div>
        </Dialog>
    );
}

function Row(props) {
    const { row, clickTask } = props;
    const [open, setOpen] = React.useState(false);

    const downloadFile = (uri) => {
        window.open(uri)
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
                </TableCell>
                <TableCell component="th" scope="row" onClick={() => clickTask()}>
                    {row.id}
                </TableCell>
                <TableCell>
                    <Tooltip title={row.original.result_name}>
                        <p onClick={() => downloadFile(row.original.result_name)}>
                            {row.original.result_name}
                        </p>
                    </Tooltip>
                </TableCell>
                <TableCell align="right">
                    <div>创建时间：{row.create_time} </div>
                    <div>最后一次运行时间：{row.task_info.last_run_time} </div>
                    <div>下一次运行时间：{row.task_info.next_run_time} </div>
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
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export default function TaskList(props) {

    const [formDialog, setFormDialog] = React.useState(false);
    const [formValue, setFormValue] = React.useState(null);
    const [taskList, setTaskList] = React.useState([])
    const [selectedIndex, setSelectedIndex] = React.useState(-1)
    const [openAlertBar, setOpenAlertBar] = React.useState(false)
    const [alertBarMsg, setAlertBarMsg] = React.useState("")

    useEffect(() => {
        get_task_list()
    }, []);

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
        task_add(value)
    }

    const update_task = (value) => {
        axios.post("/tasks/add", {
            "urls": value.original.urls,
            "result_name": value.original.result_name,
            "md5": ""
        }).then(res => {
            console.log(res)
        }).catch(e => {
            console.log(e)
        })
    }

    const task_add = (value) => {
        axios.post("/tasks/add", {
            "urls": value.original.urls,
            "result_name": 'static/' + value.original.result_name + ".m3u",
            "md5": ""
        }).then(res => {
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
        axios.delete("tasks/delete/" + value.id).then(res => {
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
        axios.get("/tasks/list").then(res => {
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

    return (
        <div>
            <Button variant="contained" onClick={() => handleClickOpen(null)}>新增</Button>
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
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 1024 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>任务id</TableCell>
                            <TableCell>输出文件</TableCell>
                            <TableCell align="right">其他</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {taskList.map((row) => (
                            <Row key={row.id} row={row} clickTask={() => handleClickOpen(row)} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}