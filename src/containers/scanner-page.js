import { SerialPort } from '../utils/chrome-serial-port';
import React from 'react';
import Button from '../components/button';
// import FormGroup from '../components/form/group';
// import FormLabel from '../components/form/label';
// import FormError from '../components/form/error';
// import Input from '../components/form/input/';
import { connect } from 'react-redux';

import { loadClient, printInfo, storePhone, storeExtensionId, storePorts } from '../actions/scanner';

import Container from '../components/container';

function mapStateToProps(state) {
  const local = state.scanner;
  return {
    contact: local.get('contact') ? local.get('contact').toJSON() : null,
    requestInProgress: local.get('pending'),
    phone: local.get('phone'),
    extensionId: local.get('extensionId'),
    ports: local.get('ports'),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    load: () => dispatch(loadClient()),
    printContact: () => dispatch(printInfo()),
  };
}

class ScannerPage extends React.Component {
  static contextTypes = {
    store: React.PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.onPhoneKeyPress = this.onPhoneKeyPress.bind(this);
    this.onPhoneChange = this.onPhoneChange.bind(this);
    this.onExtensionIdChange = this.onExtensionIdChange.bind(this);

    this.onWindowKeyPress = this.onWindowKeyPress.bind(this);
    this.isDomAvailable = typeof(window) !== 'undefined';

    this.listPorts = this.listPorts.bind(this);
  }

  componentDidMount() {
    this.dispatch = this.context.store.dispatch;
    this.phoneInput.focus();

    if (this.isDomAvailable) {
      // HID scanner
      window.addEventListener('keypress', this.onWindowKeyPress);
    }
  }

  componentWillUnmount() {
    if (this.isDomAvailable) {
      window.removeEventListener('keypress', this.onWindowKeyPress);
    }
  }

  // TODO: move to separate service in production version
  onWindowKeyPress(evt) {
    // Got here: http://www.deadosaurus.com/detect-a-usb-barcode-scanner-with-javascript/
    // check the keys pressed are numbers
    if (evt.which >= 48 && evt.which <= 57) {
      // if a number is pressed we add it to the chars array
      this.barcodeChars.push(String.fromCharCode(evt.which));
    }
    // console.log('onWindowKeyPress:', evt.which);

    if (this.barcodeLoad === false) {
      setTimeout(() => {
        // check we have a long length e.g. it is a barcode
        if (this.barcodeChars.length >= 10) {
          const barcode = this.barcodeChars.join('').trim();
          // console.log('Barcode:', barcode);
          this.dispatch(storePhone(barcode));
          this.dispatch(loadClient());
        }

        this.barcodeChars = [];
        this.barcodeLoad = false;
      }, 500);
    }

    this.barcodeLoad = true;
  }


  onPhoneKeyPress(evt) {
    if (evt.key === 'Enter') {
      this.dispatch(loadClient());
    }
  }

  onPhoneChange() {
    this.dispatch(storePhone(this.phoneInput.value));
  }

  onExtensionIdChange() {
    this.dispatch(storeExtensionId(this.extensionIdInput.value));
    this.closePort();
  }

  render() {
    const {
      contact,
      phone,
      extensionId,
      requestInProgress,
      load,
      printContact,
      ports,
    } = this.props;

    let contactInfo = null;
    if (contact) {
      contactInfo = (
        <div className="p2">
          <p>Name: { contact.name  }</p>
          <p>Phone: { contact.phone }</p>
          <br/>
          <Button data-ref="print" className="col-2 no-print" onClick={ printContact }>Print</Button>
        </div>
      );
    }

    return (
      <Container testid="scanner" size={3} center>
        <h2 data-testid="scanner-heading" className="center no-print" id="qa-counter-heading">Scanner</h2>

        <div className="overflow-hidden border rounded">
          <div className="p1 bold white bg-blue no-print">
            COM port setup
          </div>
          <div className="p1 no-print">
            <p>
              Setup registered extension id from <a href="chrome://extensions/" target="_blank">chrome://extensions/</a>.
              Extension must be loaded manully (demo mode) from <i>barcode-scanner/extension/</i> folder in app folder.
              Its name is 'dicom-chrome-serialport';
            </p>
            <input
              type="text"
              className="field col-6"
              ref={(input) => { this.extensionIdInput = input; }}
              onChange = { this.onExtensionIdChange  }
              placeholder="Enter extension id"
              value={ extensionId }
            />
            <button data-ref="load-info" className="btn btn-primary ml1 bg-orange"
              onClick={ this.listPorts } disabled={ !extensionId }>
              List Ports
            </button>

            {ports && ports.length ?
              <div>
                <label className="label">Ports: </label>
                <select className="field col-6">
                  {
                    ports.map((port) => {
                      return <option value={port.comName}>{`${port.comName}: ${port.manufacturer}`}</option>;
                    })
                  }
                </select>
                <button data-ref="load-info" className="btn btn-primary ml1 bg-blue"
                  onClick={ this.connectPort }>
                  Connect
                </button>
              </div> : null
            }

          </div>

          <div className="p1 bold white bg-blue no-print">
            Search
          </div>
          <div className="p1 no-print">
            <input
              type="text"
              className="field col-6"
              ref={(input) => { this.phoneInput = input; }}
              onKeyPress = { this.onPhoneKeyPress }
              onChange = { this.onPhoneChange }
              placeholder="Enter phone number"
              value={ phone }
            />
            <button data-ref="load-info" className="btn btn-primary ml1 bg-orange"
              onClick={ load } disabled={ !phone || requestInProgress }>
              Search
            </button>

          </div>
          <div className="p1 bold white bg-orange">
            Contact info
          </div>

          { contactInfo }

        </div>
      </Container>
    );
  }

  connectScanner() {
    // ComScanner integration
    return SerialPort.isInstalled(this.props.extensionId);
  }

  listPorts() {
    this.connectScanner().then(res => {
      console.log('Scanner connected', res);
      return SerialPort.listSerialPorts();
    }).then(ports => {
      console.log('Loaded ports', ports);
      // this.serialPort = new SerialPort();
      this.dispatch(storePorts(ports));
    }).catch(err => {
      this.showSerialPortError(err);
    });
  }

  closePort() {
    if (this.serialPort) {
      this.dispatch(storePorts([]));
      return this.serialPort.then(() => {
        this.serialPort = null;
      }).catch(err => {
        this.showSerialPortError(err);
      });
    }

    return Promise.resolve(true);
  }

  showSerialPortError(err) {
    console.log('COM error', err);
    alert(err && err.message ? err.message : (error || 'COM interaction error'));
  }

  connectPort() {
    alert('Work in progress');
  }

  serialPort = null;
  barcodeChars = [];
  barcodeLoad = false;
}

ScannerPage.propTypes = {
  contact: React.PropTypes.object,
  phone: React.PropTypes.string,
  extensionId: React.PropTypes.string,
  ports: React.PropTypes.array,
  requestInProgress: React.PropTypes.bool,

  load: React.PropTypes.func,
  printContact: React.PropTypes.func,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScannerPage);

