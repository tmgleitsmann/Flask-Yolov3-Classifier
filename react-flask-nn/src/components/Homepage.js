import React from 'react';
import ReactDOM from 'react-dom';
import Header from '../components/Header';
import {Link, NavLink} from 'react-router-dom';

class Homepage extends React.Component{

    onSubmit = (e) => {
        e.preventDefault();
        //will need to reach out to redux action to make our POST request.
        //can re-route if necessary or re-render to a loading icon/gif/whatever
    }

    render(){
        return(
            <div id="page-top">
                <Header />
                <header className="masthead text-center text-white d-flex" id="header-img">
                    <div className="container my-auto">
                        <div className="row">
                            <div className="col-lg-10 mx-auto">
                                <h1 className="text-uppercase"><strong>Neural Network + Computer Vision</strong></h1>
                                <hr />
                            </div>
                        </div>
                        <div className="col-lg-8 mx-auto">
                            <p className="text-faded mb-5">We do the heavy lifting for you. Just upload your images or videos and allow us to detect and track objects for you. *Videos not yet supported*</p>
                        </div>
                    </div>
                </header>
                <section id="about" className="bg-primary">
                    <div className="container">
                        <div className="row">
                            <div className="col offset-lg-8 mx-auto text-center">
                                <h2 className="text-white section-heading">We&#39;ve got what you need!</h2>
                                <hr className="light my-4" />
                                <p className="text-faded mb-4">Upload your media files to send to a server hosted flask application that classifies and tracks objects. Recieve updated media content alongside processing analytics.</p><NavLink className="btn btn-light btn-xl js-scroll-trigger" role="button"
                                    to="/upload">Upload media!</NavLink></div>
                        </div>
                    </div>
                </section>
                <section id="portfolio" className="p-0">
                    <div className="container-fluid p-0">
                        <div className="row no-gutters popup-gallery">
                            <div className="col-sm-6 col-lg-4"><a className="portfolio-box" href="../images/fullsize/people.jpg"><img className="img-fluid" src="../images/thumbnails/people.jpg" /><div className="portfolio-box-caption"><div className="portfolio-box-caption-content"><div className="project-category text-faded"><span>CATEGORY</span></div><div className="project-name"><span>People</span></div></div></div></a></div>
                            <div
                                className="col-sm-6 col-lg-4"><a className="portfolio-box" href="../images/fullsize/cars.jpg"><img className="img-fluid" src="../images/thumbnails/cars.jpg" /><div className="portfolio-box-caption"><div className="portfolio-box-caption-content"><div className="project-category text-faded"><span>Category</span></div><div className="project-name"><span>Vehicles</span></div></div></div></a></div>
                        <div
                            className="col-sm-6 col-lg-4"><a className="portfolio-box" href="../images/fullsize/domestic.jpg"><img className="img-fluid" src="../images/thumbnails/domestic.jpg" /><div className="portfolio-box-caption"><div className="portfolio-box-caption-content"><div className="project-category text-faded"><span>Category</span></div><div className="project-name"><span>Domestic Animals</span></div></div></div></a></div>
                    <div
                        className="col-sm-6 col-lg-4"><a className="portfolio-box" href="../images/fullsize/electronics.jpg"><img className="img-fluid" src="../images/thumbnails/electronics.jpg" /><div className="portfolio-box-caption"><div className="portfolio-box-caption-content"><div className="project-category text-faded"><span>Category</span></div><div className="project-name"><span>Electronics</span></div></div></div></a></div>
                        <div
                            className="col-sm-6 col-lg-4"><a className="portfolio-box" href="../images/fullsize/wildlife.jpg"><img className="img-fluid" src="../images/thumbnails/wildlife.jpg" /><div className="portfolio-box-caption"><div className="portfolio-box-caption-content"><div className="project-category text-faded"><span>Category</span></div><div className="project-name"><span>Wildlife</span></div></div></div></a></div>
                            <div
                                className="col-sm-6 col-lg-4"><a className="portfolio-box" href="../images/fullsize/6.jpg"><img className="img-fluid" src="../images/thumbnails/6.jpg" /><div className="portfolio-box-caption"><div className="portfolio-box-caption-content"><div className="project-category text-faded"><span>Category</span></div><div className="project-name"><span>Misc</span></div></div></div></a></div>
                            </div>
                        </div>
                </section>
            </div>
        );
    }

}

export default Homepage;