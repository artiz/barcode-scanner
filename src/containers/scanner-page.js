import * as SerialPortFactory from 'chrome-serialport';
import React from 'react';
import Button from '../components/button';
// import FormGroup from '../components/form/group';
// import FormLabel from '../components/form/label';
// import FormError from '../components/form/error';
// import Input from '../components/form/input/';
import { connect } from 'react-redux';

import { loadClient, printInfo, storePhone } from '../actions/scanner';

import Container from '../components/container';

const SerialPort = SerialPortFactory.SerialPort;

function mapStateToProps(state) {
  const local = state.scanner;
  return {
    contact: local.get('contact') ? local.get('contact').toJSON() : null,
    requestInProgress: local.get('pending'),
    phone: local.get('phone'),
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
    this.onWindowKeyPress = this.onWindowKeyPress.bind(this);
    this.isDomAvailable = typeof(window) !== 'undefined';
  }

  componentDidMount() {
    this.dispatch = this.context.store.dispatch;
    this.phoneInput.focus();

    if (this.isDomAvailable) {
      // HID scanner
      window.addEventListener('keypress', this.onWindowKeyPress);

      // ComScanner integration
      SerialPortFactory.extensionId = 'ianojeajhgmlpeboogaeajobngdnhlko';
      if (typeof('chrome') !== 'undefined') {
        chrome.runtime.sendMessage(SerialPortFactory.extensionId, { op: 'getManifest', 'message': 'ping' },
          (response) => {
            if (chrome.runtime.lastError) {
              return console.log('ERROR:', chrome.runtime.lastError);  // eslint-disable-line no-console
            }

            if (response && response.error) {
              return console.log('ERROR:', response.error);  // eslint-disable-line no-console
            }

            const sp = new SerialPort();
            console.log('sp:', sp);
            return console.log('SUCCESS:', response.data);  // eslint-disable-line no-console
          });
      } else {
        console.log('Google Chrome API is not available'); // eslint-disable-line no-console
      }
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

  render() {
    const { contact,
      phone,
      requestInProgress,
      load,
      printContact } = this.props;

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

  barcodeChars = [];
  barcodeLoad = false;
}

ScannerPage.propTypes = {
  contact: React.PropTypes.object,
  phone: React.PropTypes.string,
  requestInProgress: React.PropTypes.bool,

  load: React.PropTypes.func,
  printContact: React.PropTypes.func,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScannerPage);
