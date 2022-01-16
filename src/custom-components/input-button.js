import React, { useEffect, useRef, useState } from 'react';
import '../css/input-button.css';
const electron = window.require('electron');
const {shell} = window.require('electron');
const remote = electron.remote;
const ipc = window.require('electron').ipcRenderer;

export default function FormButton(props) {
    const [file, setFile] = useState(null);
    const { type } = props;

    const changeHandler = (e) => {
        setFile(e.target.files[0]);
    };
    const inputFileNode = useRef(null);
    const onFileClick = () => {
        inputFileNode.current.click();
    };
    useEffect(() => {
        if (file) {
            props.onUpload(file);
        }
    }, [file]);
    const openDialog = () => {
        ipc.send('open-file-dialog-for-file')

    }
    const Button = () => {
        if (type === 'upload') {
            return (
                <>
                    <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => changeHandler(e)}
                        style={{
                            display: 'none',
                        }}
                        id="file-node"
                        ref={inputFileNode}
                    />
                    <div
                        className="modal-body-custom upload-button"
                        onClick={() => openDialog()}
                    >
                        {props.label}
                    </div>
                </>
            );
        } else {
            return (
                <div className="modal-body-custom cancel-button">
                    {props.label}
                </div>
            );
        }
    };
    return <Button />;
}
