import React from 'react';
import ReactDOM from 'react-dom';
import Header from '../components/Header';
import { connect } from 'react-redux';

class About extends React.Component{

    constructor(props) {
        super(props);
    }
    render(){
        return(
            <div id="page-top">
            <Header />
                    <header className="masthead" style={{"background": "url('../images/bg-pattern.png'), linear-gradient(to left, #828282, #f05f40)", "height": "100%"}}>
                        <div className="container h-100">
                            <div className="row h-100">
                                <div className="col-lg-7 my-auto">
                                    <div className="mx-auto header-content">
                                        <h1 className="text-uppercase"><strong>Using the power of OpenCV and YoloV3, object classification has never been easier!</strong></h1>
                                    </div>
                                </div>
                                <div className="col-lg-5 my-auto">
                                    <div className="device-container">
                                        <div className="device-mockup iphone6_plus portrait white">
                                            <div className="device" id = "dev_img">
                                                <div className="screen" style={{"textAlign":"center"}}><img className="img-fluid" src="../images/demo-screen-1.png" style={{"max-width":"70%", "height":"auto"}}/></div>
                                                <div className="button"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="iphone-mockup"></div>
                                </div>
                            </div>
                        </div>
                    </header>
                    <section id="features" className="features">
                        <div className="container">
                            <div className="section-heading text-center">
                                <h2>Simple, Efficient, Powerful</h2>
                                <p className="text-muted">Detect up to 80 different classes in just seconds!</p>
                                <hr />
                            </div>
                        </div>
                        <div className="container">
                            <div style={{"textAlign":"center"}}>
                                <p className="text-muted"><br />When you upload your media files, the React application will encode your file into bytes and pass them to a flask server as a request object. Flask will decode the object with base64 decode and interpret the resulting byte string
                                    with OpenCV. The flask server will then pass the media through the YoloV3 model (hosted with Keras) to grab the boxes, labels and scores. These will then be drawn onto the media, serialized into a json response object, then returned
                                    back to the front-end. <br /><br /><br /></p>
                            </div>
                        </div>
                    </section>
                </div>
        );
    }
}
export default About;