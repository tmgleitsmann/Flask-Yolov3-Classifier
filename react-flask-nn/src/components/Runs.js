import React from 'react';
import ReactDOM from 'react-dom';
import Header from '../components/Header';
import { connect } from 'react-redux';

class Runs extends React.Component{

    constructor(props){
        super(props);
    }

    render(){       
        return(
            <div id="page-top">
                <Header />
                <section id="about" className="bg-primary">
                    <div className="container">
                        <div className="row">
                            <div className="col offset-lg-8 mx-auto text-center">
                                <h2 className="text-white section-heading">Hang tight!</h2>
                                <hr className="light my-4" />
                                <p className="text-faded mb-4">If you don&#39;t see what you&#39;re looking for, there&#39;s a chance it might still be processing on the flask server. Processing times are dependent on the server so we may need a little time.</p>
                            </div>
                        </div>
                    </div>
                </section>
                {this.props.files.map(file => {
                    return (    
                        <div className="card" key={ file.name }><img className="card-img w-100 d-block" src={`data:image/${file.ext};base64,${file.processedImage}`}/>
                            <div className="card-img-overlay">
                                <h4>{file.name}</h4>
                            </div>
                        </div>
                    );
               })}
            </div>
    )}

}

const mapStateToProps = (state, props) => {
    return {
        files: state.files,
    };
};

export default connect(mapStateToProps, null)(Runs);
