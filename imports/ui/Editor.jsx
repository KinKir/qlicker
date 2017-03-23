/* global CKEDITOR */
// QLICKER
// Author: Enoch T <me@enocht.am>
//
// Editor.jsx: react wrapper for ckeditor

import React, { Component } from 'react'

import { QuestionImages } from '../api/questions'

export class Editor extends Component {

  constructor (p) {
    super(p)

    this.state = { val: this.props.val }
    this.editor = null
  }

  setupCKEditor () {
    CKEDITOR.plugins.addExternal('confighelper', '/ckeditor/plugins/confighelper/', 'plugin.js')
    CKEDITOR.plugins.addExternal('notification', '/ckeditor/plugins/notification/', 'plugin.js')
    CKEDITOR.plugins.addExternal('notificationaggregator', '/ckeditor/plugins/notificationaggregator/', 'plugin.js')
    CKEDITOR.plugins.addExternal('filetools', '/ckeditor/plugins/filetools/', 'plugin.js')
    CKEDITOR.plugins.addExternal('uploadwidget', '/ckeditor/plugins/uploadwidget/', 'plugin.js')
    CKEDITOR.plugins.addExternal('uploadimage', '/ckeditor/plugins/uploadimage/', 'plugin.js')

    // if (this.editor) {
    //   this.editor.destroy()
    //   this.editor = null
    // }

    this.editor = CKEDITOR.inline(this.refs.theEditor, {
      placeholder: this.props.placeholder || '',
      customConfig: '/ckeditor/config.js'
    })
    this.editor.on('change', () => {
      this.props.change(this.editor.getData(), this.editor.editable().getText())
    })
  }

  componentDidMount () {
    this.setupCKEditor()
    this.componentDidUpdate()
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ val: nextProps.val })
  }

  componentDidUpdate () {
    // this.setupCKEditor()
    // if (this.editor) this.editor.setData(this.state.val)

    // new Dropzone('#question-image-uploader', {
    //   url: '/some/random/url',
    //   accept: (file, done) => {
    //     QuestionImages.insert(file, (err, fileObj) => {
    //       console.log(err, fileObj)
    //       alertify.success('Image Uploaded')
    //     })
    //   }
    // })<div id='question-image-uploader' className='dropzone question-image-dropzone'>&nbsp;</div>
  }

  render () {
    const plchldr = this.props.placeholder || ''
    return (<div className={'editor-wrapper ' + this.props.className}>
      <div className='ckeditor-wrapper'>
        <textarea ref='theEditor' className='wysiwyg-editor' value={this.state.val} placeholder={plchldr} />
      </div>
      {/*<div className='image-button-wrapper'>
        <span className='glyphicon glyphicon-picture' />
      </div>*/}
    </div>)
  } //  end render

} // end Editor
