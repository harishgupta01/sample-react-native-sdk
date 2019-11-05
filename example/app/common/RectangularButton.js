import React, {Component} from 'react';
import {View, StyleSheet, Text, TouchableHighlight} from 'react-native';
import PropTypes from 'prop-types';

export default class RectangularButton extends Component {
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

RectangularButton.propTypes = {
  text: PropTypes.string.isRequired,
  handleOnPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  wrapper: {
    height: 50,
    width: 250,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#319ed9',
    backgroundColor: '#319ed9',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#ffffff',
    textAlign: 'center',
  }
});