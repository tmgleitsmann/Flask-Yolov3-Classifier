import React from 'react'

class Progress extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    return (
      <div className="ProgressBar">
        <div
          className="Progress"
          style={{ width: this.props.progress + '%' }}
        />
      </div>
    )
  }
}

export default Progress