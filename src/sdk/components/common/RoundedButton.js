import React, {Component} from 'react';
import {View, StyleSheet, Text, TouchableHighlight} from 'react-native';
import PropTypes from 'prop-types';

export default class RoundedButton extends Component {
  render() {
    const {text, handleOnPress} = this.props;
    return(
      <View>
        <TouchableHighlight style={styles.wrapper} 
          onPress={handleOnPress}>
          <Text  style={styles.buttonText}>{text}</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

RoundedButton.propTypes = {
  text: PropTypes.string.isRequired,
  handleOnPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    borderColor: 'white', 
    borderWidth: 1,
    borderRadius: 40,
    padding: 10,
    backgroundColor: '#0D47A1',
    width: '50%',
    alignSelf: 'center',
    margin: '5%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700'
  }
});