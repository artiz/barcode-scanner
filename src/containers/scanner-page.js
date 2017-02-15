import React from 'react';
import Button from '../components/button';
import FormGroup from '../components/form/group';
import FormLabel from '../components/form/label';
// import FormError from '../components/form/error';
import Input from '../components/form/input/';

import { connect } from 'react-redux';

import { loadInfo, print } from '../actions/scanner';

import Container from '../components/container';

function mapStateToProps(state) {
  return {
    contactInfo: state.scanner.get('contactInfo'),
    fields: {},
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadInfo: () => dispatch(loadInfo()),
    print: () => dispatch(print()),
  };
}

function ScannerPage({
    contactInfo,
  }) {
  return (
    <Container testid="scanner" size={2} center>
      <h2 data-testid="scanner-heading" className="center" id="qa-counter-heading">Scanner</h2>

      <FormGroup>
        <FormLabel>Phone</FormLabel>
        <Input type="text" id="qa-phone-input"/>
      </FormGroup>

      <h3>Contact info</h3>
      { contactInfo }

      <Button data-ref="print" className="col-2" onClick={ print }>
        Print client info
      </Button>


    </Container>
  );
}

ScannerPage.propTypes = {
  contactInfo: React.PropTypes.object,
  loadInfo: React.PropTypes.func,
  print: React.PropTypes.func,
  fields: React.PropTypes.object.isRequired,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScannerPage);
