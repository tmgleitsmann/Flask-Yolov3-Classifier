import React from 'react';
import ReactDOM from 'react-dom';
import {Link, NavLink} from 'react-router-dom';

class Header extends React.Component{

    constructor(props){
        super(props);
    }

    render(){
        return(
            <div>
                <nav className="navbar navbar-light navbar-expand-lg fixed-top" id="mainNav">
                    <div className="container"><NavLink className="navbar-brand js-scroll-trigger" to="/">Gleitsmann</NavLink><button data-toggle="collapse" data-target="#navbarResponsive" className="navbar-toggler navbar-toggler-right" type="button" aria-controls="navbarResponsive" aria-expanded="false"
                            aria-label="Toggle navigation"><i className="fa fa-align-justify"></i></button>
                        <div className="collapse navbar-collapse" id="navbarResponsive">
                            <ul className="nav navbar-nav ml-auto">
                                <li role="presentation" className="nav-item"><NavLink className="nav-link js-scroll-trigger" to="/About">About</NavLink></li>
                                <li role="presentation" className="nav-item"><NavLink className="nav-link js-scroll-trigger" to="/Upload">Upload</NavLink></li>
                                <li role="presentation" className="nav-item"><NavLink className="nav-link js-scroll-trigger" to="/Runs">Runs</NavLink></li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        );
    }
}
export default Header;