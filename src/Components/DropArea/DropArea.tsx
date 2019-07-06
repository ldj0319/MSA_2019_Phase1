import * as React from 'react'
import ReactDropzone from 'react-dropzone'
import './DropArea.css'

interface IState {
    imageFiles: any[],
    dropzone: any,
}

interface IProps{
    setResults:any
    
}

export default class DropArea extends React.Component<IProps, IState>{
    constructor(props: any) {
        super(props)
        this.state = {
            dropzone: this.onDrop.bind(this),
            imageFiles: [],          
        }
    }
    public onDrop(files: any) {
        this.setState({
            imageFiles: files,
        })
        this.props.setResults("",this.state.imageFiles.length)
        const file = files[0]
        const reader = new FileReader();
        reader.onload = (event) => {
            const binaryString = (event.target as FileReader).result;
            if (typeof binaryString === "string") {
                this.test_upload(btoa(binaryString))
            }
        };
        try{
            reader.readAsBinaryString(file);
        }catch(error){
            this.props.setResults("Sorry we had trouble loading that file please use a downloaded image file",0);
        }
    }
  
    public upload(base64String: any) {
        const base64 = require('base64-js');
        const byteArray = base64.toByteArray(base64String);
        fetch('https://whatsmyage.azurewebsites.net/image', {
            body: byteArray,
            headers: {
                'Content-Type': 'application/octet-stream',
            },
            method: 'POST'
        })
            .then((response: any) => {
                if (!response.ok) {
                    this.props.setResults("Sorry there was an error",this.state.imageFiles.length)
                } else {
                    response.json().then((json: any[]) => {
                        if(json.length<1){
                            this.props.setResults("Sorry no face detected",this.state.imageFiles.length)
                        }else{
                            this.props.setResults("Age is "+json[0].faceAttributes.age,this.state.imageFiles.length)
                        }
                    })
                }
            })
    }

    public test_upload(base64String: any) {
        let smileText = "";
        let message = "";
        const base64 = require('base64-js');
        const byteArray = base64.toByteArray(base64String);
        fetch('https://prod-23.australiasoutheast.logic.azure.com:443/workflows/5da5f52b84f64d68ae11a4a8af437073/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=d7CWr7HzSGkmHbpw1PR_ID9vPSEzA5fv6W2To5frRxQ', {
            body: byteArray,
            headers: {
                'Content-Type': 'application/octet-stream',
            },
            method: 'POST'
        })
            .then((response: any) => {
                if (!response.ok) {
                    this.props.setResults("Sorry there was an error",this.state.imageFiles.length)
                } else {
                    response.json().then((json: any[]) => {
                        if(json.length<1){
                            this.props.setResults("Sorry no face detected",this.state.imageFiles.length)
                        }else{
                            message += json.length + " People at pic...   ";
                            for(let i = 0; i < json.length; i++){
                                if(json[i].faceAttributes.smile === 1){
                                    smileText = "Yes"
                                }
                                else{
                                    smileText = "No"
                                }
                                message += 
                                    " || " + (i+1) + " Person --> " +
                                    "Age: " + json[i].faceAttributes.age + 
                                    ",\nGender: " + json[i].faceAttributes.gender +
                                    ",\nHair: " + json[i].faceAttributes.hair.hairColor[i].color +
                                    ",\nSmile: " + smileText;
                            }
                            this.props.setResults(message,this.state.imageFiles.length)
                        }
                    })
                }
            })
    }

    public render() {
        return (
            <div className="cont">
                <div className="centreText">
                    <div className="dropZone">
                        <ReactDropzone accept='image/*' onDrop={this.state.dropzone} style={{ position: "relative" }}>
                            <div className="dropZoneText">
                                {
                                    this.state.imageFiles.length > 0 ?
                                        <div>{this.state.imageFiles.map((file) => <img className="image1" key={file.name} src={file.preview} />)}</div> :
                                        <p>(Image)</p>
                                }
                            </div>
                        </ReactDropzone>
                    </div>
                </div>
            </div>
        )
    }
}