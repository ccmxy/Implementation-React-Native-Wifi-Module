'use strict';
var React       = require('react-native');
var wifiModule = require('react-native-wifi-module');
var simpleAlert = require('./ModuleExports/AlertModule');
var TimerMixin = require('react-timer-mixin');

var {
  AppRegistry,
  StyleSheet,
  Text,
  ListView,
  TouchableHighlight,
  View,
} = React;

var AndroidWifiReactNative = React.createClass({
  mixins: [TimerMixin],

  getInitialState: function() {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      loading: false,
      connected: false,
    };
  },

  componentDidMount: function() {
    this.loadWifiListData();
  },

  loadWifiListData: function() {
    wifiModule.loadWifiList(
      (wifiArray) => {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(wifiArray),
        });
      },

      (msg) => {
        console.log(msg);
      },
    );
  },

  _pressRow: function(ssid: string) {
    this.setState({ssid: ssid});
    simpleAlert.alert(
      ssid,
      'Join this network? (Note: Wait 10 seconds after pressing yes)',
      [
        { type: simpleAlert.POSITIVE_BUTTON, text: 'Yes'},
        { type: simpleAlert.NEGATIVE_BUTTON, text: 'Cancel'},
      ],
      true,
      (password) => {
        wifiModule.findAndConnect(this.state.ssid, password);
        this.wifiConnectCycle();
        this.setState({loading: true});
      }
    );
  },

  wifiConnectCycle: function() {
    // calls this.checkConnectionStatus() every 1 second
    this.checkConnectionTimer = this.setInterval(()=> {
      this.checkConnectionStatus();
    }, 1000);

    //After ten seconds of failure:
    this.connectionFailureTimer = this.setInterval(()=> {
      this.alertConnectionFailure();
    }, 10000);

  },

  checkConnectionStatus: function() {
    wifiModule.connectionStatus((isConnected) => {
      if (isConnected) {
        this.navigateToAction();
      }
    },
  );
  },

  navigateToAction: function() {
    clearInterval(this.checkConnectionTimer);
    clearInterval(this.connectionFailureTimer);
    this.setState({connected: true})
  },

  alertConnectionFailure: function() {
    clearInterval(this.checkConnectionTimer);
    clearInterval(this.connectionFailureTimer);

    this.setState({loading: false});
    simpleAlert.alert(
      'Oh no, connection failure!',
      'Please try again ',
      [
        { type: simpleAlert.NEUTRAL_BUTTON, text: 'OK'},
      ],
      false,
      null
    );
  },

  _renderRow: function(rowData: string, sectionID: number, rowID: number) {
    return (
      <TouchableHighlight onPress={() => this._pressRow(rowData)}>
        <View>
          <View style={styles.row}>
            <Text>
              {rowData}
            </Text>
          </View>
          <View style={styles.separator} />
        </View>
      </TouchableHighlight>
    );
  },

  renderLoadingView: function() {
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        Connecting, please wait...
      </Text>
    </View>
  );
},

renderConnectedView: function() {
  return (
    <View>
      <Text style={styles.welcome}>
        You are CONNECTED!
      </Text>
    </View>
  );
},

  render: function() {
    if (this.state.loading) {
      return this.renderLoadingView();
    }

    if (this.state.connected) {
      return this.renderConnectedView();
    }

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to the Wifi set-up page!
        </Text>
      <ListView style={styles.listView}
        dataSource={this.state.dataSource}
        renderRow={this._renderRow}
      />
    </View>
    );
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  row: {
     flexDirection: 'row',
     justifyContent: 'center',
     padding: 10,
   },
  separator: {
    height: 1,
    backgroundColor: '#CCCCCC',
  },
  listView: {
    padding: 10,
    width: 300,
  },
});


AppRegistry.registerComponent('AndroidWifiReactNative', () => AndroidWifiReactNative);
