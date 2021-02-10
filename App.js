import React from "react";
import {
  Linking,
  View,
  Text,
  Dimensions,
  Image,
  TouchableHighlight,
  BackHandler,
  Alert,
  AsyncStorage,
} from "react-native";
import * as Facebook from "expo-facebook";
import * as Google from "expo-google-app-auth";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome";
import Carousel, { Pagination } from "react-native-snap-carousel";
import WheelOfFortune from "./libs/react-native-wheel-of-fortune/index";
import Images from "react-native-image-progress";
import Progress from "react-native-progress/Bar";
//NAVIGATOR
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { GuideMark } from "react-native-guide-mark";
const Stack = createStackNavigator();
const screenWidth = Dimensions.get("screen").width;
const screenHeigth = Dimensions.get("screen").height;
export default class App extends React.Component {
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="PantallaLogin"
          headerMode="none"
          lazy="true"
        >
          <Stack.Screen
            name="PantallaLogin"
            component={PantallaLogin}
            tabBar={() => null}
          />
          <Stack.Screen
            name="Roullete"
            component={Roullete}
            tabBar={() => null}
          />
          <Stack.Screen
            name="PantallaEspecial"
            component={PantallaEspecial}
            tabBar={() => null}
          />
          <Stack.Screen
            name="PantallaPromotion"
            component={PantallaPromotion}
            tabBar={() => null}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

class PantallaCarga extends React.Component {
  constructor({ navigation, route }) {
    super({ navigation, route });
    this.state = {};
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          height: screenHeigth,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          style={{ width: "50%", height: "50%" }}
          source={require("./resources/HOME/CARGANDO.gif")}
        ></Image>
      </View>
    );
  }
}

class PantallaPromotion extends React.Component {
  constructor({ navigation, route }) {
    super({ navigation, route });
    this.state = {
      address: route.params.address,
      logo: route.params.logo,
      name: route.params.name,
      image: route.params.image,
    };
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          height: screenHeigth,
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        <View
          style={{
            width: "100%",
            height: "20%",
            backgroundColor: "#070A27",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "95%",
              height: "95%",
              alignItems: "center",
              justifyContent: "space-evenly",
              flexDirection: "row",
            }}
          >
            <View
              style={{
                width: "20%",
                height: "60%",
              }}
            >
              <Image
                style={{
                  width: 75,
                  height: 75,
                  resizeMode: "contain", 
                }}
                source={{
                  uri: this.state.logo,
                }}
              ></Image>
            </View>
            <View
              style={{ width: "67%", height: "60%", justifyContent: "center" }}
            >
              <Text
                style={{
                  fontSize: screenWidth / 22,
                  color: "white",
                  fontWeight: "bold",
                  letterSpacing: 0.5,
                }}
              >
                {this.state.name}
              </Text>
              <Text
                style={{
                  textAlign: "left",
                  fontSize: screenWidth / 27,
                  color: "white",
                  letterSpacing: 0.5,
                }}
              >
                {this.state.address}
              </Text>
            </View>
          </View>
        </View>
        <Images
          style={{
            width: "100%",
            height: "80%",
            resizeMode: "contain",
          }}
          resizeMode= {"contain"}
          source={{
            uri: this.state.image,
          }}
        ></Images>
      </View>
    );
  }
}

class PantallaLogin extends React.Component {
  constructor({ navigation, route }) {
    super({ navigation, route });
    this.state = {
      fontsLoaded: false,
      loading: false,
      loadingtext: "",
      version: "1.0.5",
      photo2: "",
      isLoggedin: false,
      userData: null,
      isImageLoading: false,
    };
  }

  handleBackButton() {
    return true;
  }

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem("email");
      if (value !== null) {
        axios
        .post(
          "https://us-central1-disco-domain-293019.cloudfunctions.net/getdatauser",
          {
            email: value,
          }
        )
        .then((response) => {
          if (response.data.length > 0) {
            this._storeData(response.data[0].Email);
            this.props.navigation.replace("Roullete", {
              iduser: response.data[0].IDUser,
            });
            this.setState({ loading: false });
          } else {
            this.setState({ loading: false });
          }
        })
        .catch(function (error) {
          console.log(error);
          this.setState({ loading: false });
        });
      }else{
        this.setState({ loading: false });
      }
    } catch (error) {
      console.log(error);
    }
  };

  clardata = async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.log(error);
    }
  };

  enableback() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  facebookLogIn = async () => {
    this.setState({
      loading: true,
      loadingtext: "Logueandote con Facebook.",
    });
    try {
      await Facebook.initializeAsync("2812282728852167");
      const {
        type,
        token,
        expires,
        permissions,
        declinedPermissions,
      } = await Facebook.logInWithReadPermissionsAsync({
        permissions: ["email", "public_profile"],
      });
      if (type === "success") {
        await fetch(
          `https://graph.facebook.com/me/?fields=email,name&access_token=${token}`
        )
          .then((response) => response.json())
          .then((json) => {
            axios
              .post(
                "https://us-central1-disco-domain-293019.cloudfunctions.net/getdatauser",
                {
                  email: json.email,
                }
              )
              .then((response) => {
                if (response.data.length > 0) {
                  this._storeData(response.data[0].Email);
                  this.props.navigation.replace("Roullete", {
                    iduser: response.data[0].IDUser,
                  });
                  this.setState({ loading: false });
                } else {
                  axios
                    .post(
                      "https://us-central1-disco-domain-293019.cloudfunctions.net/RegisterClient",
                      {
                        email: json.email,
                      }
                    )
                    .then((response) => {
                      this._storeData(json.email);
                      this.props.navigation.replace("Roullete", {
                        iduser: response.data.insertId,
                      });
                      this.setState({ loading: false });
                    })
                    .catch(function (error) {
                      console.log(error);
                      this.setState({ loading: false });
                    });
                }
              })
              .catch(function (error) {
                console.log(error);
                this.setState({ loading: false });
              });
          })
          .catch(function (error) {
            alert(error);
          });
      } else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    }
  };

  componentDidMount() {
    //this.clardata();
    //this.setState({ loading: false });
    //this._pickImage();
    this.enableback();
    this.getversion();
    //this._clearData();
  }

    _storeData = async (email) => {
    try {
      await AsyncStorage.setItem("email", email);
    } catch (error) {
      console.log(error);
    }
  };

  getversion = async () => {
    this.setState({
      loading: true,
      loadingtext: "Comprobando versión de Vagary",
    });
    await axios
      .post(
        "https://us-central1-disco-domain-293019.cloudfunctions.net/getversion",
        {}
      )
      .then((response) => {
        if (response.data[0].Value == this.state.version) {
          this._retrieveData();
        } else {
          Alert.alert(
            "Actualización",
            "Tienes una versión diferente de Vagary.\n\nVisita nuestra página web y descarga la nueva versión.",
            [
              {
                text: "ACTUALIZAR",
                onPress: () => {
                  Linking.openURL("https://www.vagaryapp.com");
                },
              },
            ],
            { cancelable: false }
          );
        }
      })
      .catch(function (error) {
        this.setState({ loading: false });
        console.log(error);
      });
  };

  signIn = async () => {
    this.setState({ loading: true, loadingtext: "Logueandote con Google." });
    try {
      const result = await Google.logInAsync({
        androidClientId:
          "9047621973-4htof6lnmlqve0sti9tem49absoo4qr7.apps.googleusercontent.com",
        androidStandaloneAppClientId:
          "9047621973-gd79nfd97i1d0jolbrtiqe8200mkhjkv.apps.googleusercontent.com",
        iosStandaloneAppClientId:"9047621973-kdjtmd8r3ndc1dd5f411l94sa8hbp16m.apps.googleusercontent.com",
        iosClientId:"9047621973-kdjtmd8r3ndc1dd5f411l94sa8hbp16m.apps.googleusercontent.com",
        scopes: ["profile", "email"],
      });

      if (result.type === "success") {
        axios
          .post(
            "https://us-central1-disco-domain-293019.cloudfunctions.net/getdatauser",
            {
              email: result.user.email,
            }
          )
          .then((response) => {
            if (response.data.length > 0) {
              this._storeData(response.data[0].Email);
              this.props.navigation.replace("Roullete", {
                iduser: response.data[0].IDUser,
              });
              this.setState({ loading: false });
            } else {
              axios
                .post(
                  "https://us-central1-disco-domain-293019.cloudfunctions.net/RegisterClient",
                  {
                    email: result.user.email,
                  }
                )
                .then((response) => {
                  this._storeData(result.user.email);
                  this.props.navigation.replace("Roullete", {
                    iduser: response.data.insertId,
                  });
                  this.setState({ loading: false });
                })
                .catch(function (error) {
                  console.log(error);
                  this.setState({ loading: false });
                });
            }
          })
          .catch(function (error) {
            console.log(error);
            this.setState({ loading: false });
          });
      } else {
        console.log("error");
        this.setState({ loading: false });
      }
    } catch (e) {
      console.log(e);
      this.setState({ loading: false });
    }
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          height: screenHeigth,
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        {this.state.loading ? (
          <View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "white",
              justifyContent: "flex-end",
            }}
          >
            <PantallaCarga></PantallaCarga>
            <View
              style={{
                width: "100%",
                height: screenHeigth / 7,
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
              }}
            >
              <Text
                style={{
                  fontSize: screenWidth / 30,
                  color: "black",
                  letterSpacing: 1.5,
                  marginTop: "2%",
                }}
              >
                {this.state.loadingtext}
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={{
              width: screenWidth,
              height: screenHeigth,
              alignItems: "center",
              backgroundColor: "white",
            }}
          >
            <View
              style={{
                width: screenWidth,
                height: screenHeigth,
                position: "absolute",
              }}
            >
              <Image
                style={{
                  width: "100%",
                  height: screenHeigth,
                  resizeMode: "stretch",
                }}
                source={require("./resources/HOME/PIZZA.jpg")}
              ></Image>
            </View>
            <View
              style={{
                width: "100%",
                height: "41%",
                borderBottomLeftRadius: screenWidth / 20,
                borderBottomRightRadius: screenWidth / 20,
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Image
                style={{
                  width: "65%",
                  height: screenHeigth / 11,
                  resizeMode: "stretch",
                }}
                source={require("./resources/HOME/ENCABEZADO.png")}
              ></Image>
            </View>
            <View
              style={{
                width: "100%",
                height: "70%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  width: "100%",
                  textAlign: "center",
                  fontSize: screenWidth / 22,
                  color: "white",
                }}
              >
                Bienvenido a Vagary
              </Text>
              <Text
                style={{
                  width: "100%",
                  textAlign: "center",
                  fontSize: screenWidth / 35,
                  color: "white",
                }}
              >
                Encuentra tu lugar ideal para comer.
              </Text>
              <View
                style={{
                  width: "100%",
                  height: screenHeigth / 12,
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <TouchableHighlight
                  style={{
                    width: "60%",
                    height: screenHeigth / 16,
                    borderRadius: screenWidth / 39,
                    backgroundColor: "white",
                    alignItems: "center",
                    shadowColor: "rgba(0, 0, 0, 0.1)",
                    shadowOpacity: 0.8,
                    elevation: 1,
                    shadowOffset: { width: 1, height: 13 },
                  }}
                  onPress={this.facebookLogIn}
                >
                  <View
                    style={{
                      width: "90%",
                      height: "100%",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      style={{
                        width: "12%",
                        height: "60%",
                        resizeMode: "stretch",
                        position: "absolute",
                      }}
                      source={require("./resources/HOME/Facebook.png")}
                    ></Image>
                    <Text
                      style={{
                        width: "100%",
                        textAlign: "center",
                        width: screenWidth / 1.6,
                        fontSize: screenWidth / 26,
                      }}
                    >
                      Continua con Facebook
                    </Text>
                  </View>
                </TouchableHighlight>
              </View>
              <View
                style={{
                  width: "100%",
                  height: screenHeigth / 12,
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <TouchableHighlight
                  style={{
                    width: "60%",
                    height: screenHeigth / 16,
                    borderRadius: screenWidth / 39,
                    backgroundColor: "white",
                    alignItems: "center",
                    shadowColor: "rgba(0, 0, 0, 0.1)",
                    shadowOpacity: 0.8,
                    elevation: 1,
                    shadowOffset: { width: 1, height: 13 },
                  }}
                  onPress={this.signIn}
                >
                  <View
                    style={{
                      width: "90%",
                      height: "100%",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      style={{
                        width: "12%",
                        height: "60%",
                        resizeMode: "stretch",
                        position: "absolute",
                      }}
                      source={require("./resources/HOME/Google.png")}
                    ></Image>
                    <Text
                      style={{
                        width: "100%",
                        textAlign: "center",
                        width: screenWidth / 1.6,
                        fontSize: screenWidth / 26,
                      }}
                    >
                      Continua con Google
                    </Text>
                  </View>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }
}

class PantallaEspecial extends React.Component {
  constructor({ navigation, route }) {
    super({ navigation, route });
    this.state = {
      offers: [],
      iduser: route.params.iduser,
      offer: route.params.offer,
      activeSlide: 0,
      loading: false,
      loadingtext: "",
      visible: false,
      visiblestep1: false,
    };
  }

  _storeData = async () => {
    try {
      await AsyncStorage.setItem("Tutorial", "1");
    } catch (error) {
      console.log(error);
    }
  };

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem("Tutorial");
      if (value === null) {
        this.setState({ visiblestep1: true });
      }
    } catch (error) {
      console.log(error);
    }
  };

  CheckOffers = async (winnieable) => {
    this.setState({ loading: true, loadingtext: "Cargando promociones." });
    let temporal = 0;
    if (winnieable) {
      temporal = 1;
    }
    let fecha =
      new Date().getFullYear() +
      "-" +
      (new Date().getMonth() + 1) +
      "-" +
      new Date().getDate();
    axios
      .post(
        "https://us-central1-disco-domain-293019.cloudfunctions.net/CheckOffers",
        {
          date: fecha,
        }
      )
      .then((response) => {
        let temporal = [];
        for (let i = 0; i < response.data.length; i++) {
          if (response.data[i].IsBetter == "1") {
            if (this.state.offer) {
              temporal.push({
                idparter: response.data[i].IDPartner,
                description: response.data[i].OfferDescription,
                idoffer: response.data[i].IDOffer,
                name: response.data[i].Name,
                offername: response.data[i].OfferName,
                image: response.data[i].Image,
                price: response.data[i].Price,
                photo: response.data[i].Photo,
                fullimage: response.data[i].FullImage,
                address: response.data[i].AddressOffer,
                userlike: false,
                isbetter: response.data[i].IsBetter,
              });
            }
          } else {
            temporal.push({
              idparter: response.data[i].IDPartner,
              description: response.data[i].OfferDescription,
              idoffer: response.data[i].IDOffer,
              name: response.data[i].Name,
              offername: response.data[i].OfferName,
              image: response.data[i].Image,
              price: response.data[i].Price,
              photo: response.data[i].Photo,
              fullimage: response.data[i].FullImage,
              address: response.data[i].AddressOffer,
              userlike: false,
              isbetter: response.data[i].IsBetter,
            });
          }
        }
        this.setState({ offers: temporal });
        this.CheckUserLikes();
      })
      .catch(function (error) {
        console.log(error);
        this.setState({ loading: false });
      });
  };

  CheckUserLikes = async () => {
    let fecha =
      new Date().getFullYear() +
      "-" +
      (new Date().getMonth() + 1) +
      "-" +
      new Date().getDate();
    axios
      .post(
        "https://us-central1-disco-domain-293019.cloudfunctions.net/CheckUserLikes",
        {
          date: fecha,

          iduser: this.state.iduser,
        }
      )
      .then((response) => {
        let temporal = this.state.offers;
        for (let i = 0; i < response.data.length; i++) {
          for (let j = 0; j < temporal.length; j++) {
            if (response.data[i].IDOffer == temporal[j].idoffer) {
              temporal[j].userlike = true;
              break;
            }
          }
        }
        this.setState({ offers: temporal, loading: false });
      })
      .catch(function (error) {
        console.log(error);
        this.setState({ loading: false });
      });
  };

  componentDidMount() {
    this._retrieveData();
    this.CheckOffers();
    if (this.props.onRef != null) {
      this.props.onRef(this);
    }
  }

  get pagination() {
    const { entries, activeSlide } = this.state;
    return (
      <Pagination
        dotsLength={this.state.offers.length}
        activeDotIndex={activeSlide}
        containerStyle={{ backgroundColor: "transparent" }}
        dotStyle={{
          width: 10,
          height: 10,
          borderRadius: 5,
          marginHorizontal: 8,
          backgroundColor: "rgba(255, 255, 255, 0.92)",
        }}
        inactiveDotStyle={
          {
            // Define styles for inactive dots here
          }
        }
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />
    );
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          height: screenHeigth,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#070A27",
        }}
      >
        {this.state.loading ? (
          <View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "white",
              justifyContent: "flex-end",
            }}
          >
            <PantallaCarga></PantallaCarga>
            <View
              style={{
                width: "100%",
                height: screenHeigth / 7,
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
              }}
            >
              <Text
                style={{
                  fontSize: screenWidth / 30,
                  color: "black",
                  letterSpacing: 1.5,
                  marginTop: "2%",
                }}
              >
                {this.state.loadingtext}
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              height: screenHeigth,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#070A27",
            }}
          >
            <GuideMark
              visible={this.state.visiblestep1}
              title="Promociones"
              description="Da un toque a las promociones y podrás ver la promoción original."
              buttonTitle={"Siguiente"}
              onButtonPress={() => {
                this._storeData();
                this.setState({ visiblestep1: false, visible: true });
              }}
              onMarkPress={() => {
                this._storeData();
                this.setState({ visiblestep1: false, visible: true });
              }}
              top={"40%"}
              markSize={screenWidth / 1.9}
              left={"50%"}
            />
            <GuideMark
              visible={this.state.visible}
              title="'Likes'"
              description="Da un Like si te gusta una promoción."
              buttonTitle={"¡Entendido!"}
              onButtonPress={() => {
                this._storeData();
                this.setState({ visible: false });
              }}
              onMarkPress={() => {
                this._storeData();
                this.setState({ visible: false });
              }}
              markSize={screenWidth / 2.3}
              top={"86%"}
              left={"100%"} //3. Passing ref of pointing element to guide mark
            />
            <View
              style={{
                width: "90%",
                height: "90%",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: "10%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    width: "100%",
                    textAlign: "center",
                    width: screenWidth / 1.6,
                    fontSize: screenWidth / 20,
                    color: "white",
                  }}
                >
                  Promociones de hoy
                </Text>
              </View>
              {this.state.offers.length > 0 ? (
                <View
                  style={{ width: "90%", height: "90%", alignItems: "center" }}
                >
                  <Carousel
                    sliderWidth={screenWidth / 1.1}
                    firstItem={0}
                    itemWidth={screenWidth / 1.1}
                    data={this.state.offers}
                    renderItem={({ item, index }, parallaxProps) => {
                      return (
                        <TouchableHighlight
                          style={{
                            width: "100%",
                            height: "100%",
                            alignItems: "center",
                            shadowColor: "rgba(0, 0, 0, 0.1)",
                            shadowOpacity: 0.8,
                            elevation: 8,
                            shadowOffset: { width: 1, height: 13 },
                          }}
                          underlayColor={"transparent"}
                          onPress={() => {
                            this.props.navigation.push("PantallaPromotion", {
                              address: item.address,
                              logo: item.photo,
                              image: item.fullimage,
                              name: item.name,
                            });
                          }}
                        >
                          <View
                            style={{
                              width: "100%",
                              height: "100%",
                              alignItems: "center",
                            }}
                          >
                            <View
                              style={{
                                width: "100%",
                                height: "100%",
                                position: "absolute",
                              }}
                            >
                              <Image
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  resizeMode: "stretch",
                                  position: "absolute",
                                }}
                                source={require("./resources/HOME/Fondo.png")}
                              ></Image>
                            </View>
                            <View
                              style={{
                                width: "95%",
                                height: "20%",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexDirection: "row",
                              }}
                            >
                              <View
                                style={{
                                  width: 80,
                                  height: 80,
                                  justifyContent:"center",
                                  alignItems:"center",
                                  borderColor: "transparent",                              
                                }}
                              >
                                <Image
                                  style={{
                                    width: 75,
                                    height: 75,
                                    resizeMode: "contain",  
                                    overflow: 'hidden',                               
                                  }}
                                  source={{
                                    uri: item.photo,
                                  }}
                                ></Image>
                              </View>
                              {item.isbetter == "1" && (
                                <Text
                                  style={{
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    fontSize: screenWidth / 25,
                                    color: "white",
                                  }}
                                >
                                  ¡DESTACADA!
                                </Text>
                              )}
                              <Text
                                style={{
                                  textAlign: "center",
                                  fontSize: screenWidth / 20,
                                  color: "white",
                                }}
                              >
                                {item.price}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: "90%",
                                height: "40%",
                                paddingTop: screenWidth / 50,
                              }}
                            >
                              <Text
                                style={{
                                  fontWeight: "bold",
                                  fontSize: screenHeigth / 40,
                                  color: "white",
                                }}
                              >
                                {item.offername}
                              </Text>
                              <Text
                                style={{
                                  fontSize: screenHeigth / 45,
                                  color: "white",
                                }}
                              >
                                {item.description}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: "98%",
                                height: screenHeigth/3.6,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                              }}
                            >
                              <View
                                style={{
                                  width: "70%",
                                  height: 250,
                                  justifyContent:"center",
                                  alignItems:"center",
                                  marginTop: screenHeigth / 6,
                                  position: "absolute",
                                }}
                              >
                                <Image
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                  }}
                                  resizeMode="contain"
                                  source={{
                                    uri: item.image,
                                  }}
                                ></Image>
                              </View>
                              <View
                                style={{
                                  width: "70%",
                                  height: "100%",
                                  marginTop: screenHeigth / 6,
                                }}
                              ></View>
                              <View
                                style={{
                                  width: "20%",
                                  height: 90,
                                  borderRadius: screenWidth / 35,
                                  justifyContent: "center",
                                }}
                              >
                                <TouchableHighlight
                                  collapsable={false}
                                  ref={(ref) => (this.lastNameInput = ref)}
                                  style={
                                    item.userlike
                                      ? {
                                          width: 50,
                                          height: 50,
                                          borderRadius: screenWidth,
                                          backgroundColor: "green",
                                          borderWidth: 0,
                                        }
                                      : {
                                          width: 50,
                                          height: 50,
                                          borderRadius: screenWidth,
                                          backgroundColor: "white",
                                          borderWidth: 2,
                                          borderColor: "green",
                                        }
                                  }
                                  onPress={() => {
                                    let temporal = this.state.offers;
                                    temporal[index].userlike = !temporal[index]
                                      .userlike;

                                    if (temporal[index].userlike) {
                                      this.setState({
                                        loading: true,
                                        loadingtext: "Enviando me gusta.",
                                      });
                                      axios
                                        .post(
                                          "https://us-central1-disco-domain-293019.cloudfunctions.net/RegisterLike",
                                          {
                                            idoffer: item.idoffer,
                                            iduser: this.state.iduser,
                                          }
                                        )
                                        .then((response) => {
                                          this.setState({
                                            loading: false,
                                            offers: temporal,
                                          });
                                        })
                                        .catch(function (error) {
                                          console.log(error);
                                          this.setState({ loading: false });
                                        });
                                    } else {
                                      this.setState({
                                        loading: true,
                                        loadingtext: "Actualizando.",
                                      });
                                      axios
                                        .post(
                                          "https://us-central1-disco-domain-293019.cloudfunctions.net/UnregisterLike",
                                          {
                                            idoffer: item.idoffer,
                                            iduser: this.state.iduser,
                                          }
                                        )
                                        .then((response) => {
                                          this.setState({
                                            loading: false,
                                            offers: temporal,
                                          });
                                        })
                                        .catch(function (error) {
                                          console.log(error);
                                          this.setState({ loading: false });
                                        });
                                    }
                                  }}
                                >
                                  <View
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                    collapsable={false}
                                    ref={(ref) => (this.lastNameInput = ref)}
                                  >
                                    {item.userlike ? (
                                      <Icon
                                        name="check"
                                        size={30}
                                        color="white"
                                      />
                                    ) : (
                                      <Icon
                                        name="check"
                                        size={30}
                                        color="green"
                                      />
                                    )}
                                  </View>
                                </TouchableHighlight>
                              </View>
                            </View>
                          </View>
                        </TouchableHighlight>
                      );
                    }}
                    onSnapToItem={(index) =>
                      this.setState({ activeSlide: index })
                    }
                  />
                  {this.pagination}
                </View>
              ) : (
                <View
                  style={{
                    width: "90%",
                    height: "90%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: screenWidth / 20,
                      fontWeight: "bold",
                      color: "white",
                      textAlign: "center",
                    }}
                  >
                    {
                      "Estamos actualizando las promociones.\nRegresa en un momento ^^."
                    }
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  }
}

class Roullete extends React.Component {
  constructor({ navigation, route }) {
    super({ navigation, route });
    this.state = {
      iduser: route.params.iduser,
      valor: false,
      winnerValue: 0,
      winnerIndex: 0,
      loadingtext: "",
      loading: true,
    };
  }

  componentDidMount() {
    this.checkroullete();
  }

  RegisterRoullete = async (winnieable) => {
    let temporal = 0;
    if (winnieable) {
      Alert.alert(
        "¡Felicidades!",
        "Podrás ver la promoción destacada de hoy.\n\nRegresa todos los días y gira la ruleta para descubrir más promociones destacadas.",
        [
          {
            text: "OK",
            onPress: () => {
              this.setState({
                loading: true,
                loadingtext: "Cargando promoción especial.",
              });
              let fecha =
                new Date().getFullYear() +
                "-" +
                (new Date().getMonth() + 1) +
                "-" +
                new Date().getDate();
              axios
                .post(
                  "https://us-central1-disco-domain-293019.cloudfunctions.net/RegisterRoullete",
                  {
                    iduser: this.state.iduser,
                    date: fecha,
                    value: temporal,
                  }
                )
                .then((response) => {
                  this.props.navigation.replace("PantallaEspecial", {
                    iduser: this.state.iduser,
                    offer: winnieable,
                  });
                  this.setState({ loading: false });
                })
                .catch(function (error) {
                  console.log(error);
                  this.setState({ loading: false });
                });
            },
          },
        ],
        { cancelable: false }
      );
      temporal = 1;
    } else {
      this.setState({ loading: true, loadingtext: "Cargando promociónes." });
      Alert.alert(
        "Vagary",
        "No has tenido suerte esta vez. De todas formas podrás ver muchas promociones de hoy.\n\nRegresa todos los días y gira la ruleta para descubrir las promociones destacadas.",
        [
          {
            text: "OK",
            onPress: () => {
              let fecha =
                new Date().getFullYear() +
                "-" +
                (new Date().getMonth() + 1) +
                "-" +
                new Date().getDate();
              axios
                .post(
                  "https://us-central1-disco-domain-293019.cloudfunctions.net/RegisterRoullete",
                  {
                    iduser: this.state.iduser,
                    date: fecha,
                    value: temporal,
                  }
                )
                .then((response) => {
                  this.props.navigation.replace("PantallaEspecial", {
                    iduser: this.state.iduser,
                    offer: winnieable,
                  });
                  this.setState({ loading: false });
                })
                .catch(function (error) {
                  console.log(error);
                  this.setState({ loading: false });
                });
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  checkroullete = async () => {
    this.setState({ loading: true, loadingtext: "Cargando datos." });
    let fecha =
      new Date().getFullYear() +
      "-" +
      (new Date().getMonth() + 1) +
      "-" +
      new Date().getDate();

    axios
      .post(
        "https://us-central1-disco-domain-293019.cloudfunctions.net/CheckRoullete",
        {
          iduser: this.state.iduser,
          date: fecha,
        }
      )
      .then((response) => {
        if (response.data.length > 0) {
          if (response.data[0].Value == "1") {
            this.props.navigation.replace("PantallaEspecial", {
              iduser: this.state.iduser,
              offer: true,
            });
          } else {
            this.props.navigation.replace("PantallaEspecial", {
              iduser: this.state.iduser,
              offer: false,
            });
          }
        } else {
          this.setState({ loading: false });
        }
      })
      .catch(function (error) {
        console.log(error);
        this.setState({ loading: false });
      });
  };

  render() {
    const participants = [
      "%10",
      "%20",
      "%30",
      "%40",
      "%50",
      "%60",
      "%70",
      "%90",
      "FREE",
    ];
    const colors=[
          '#000000',
          '#00FF00',
          '#000000',
          '#00FF00',
          '#000000',
          '#00FF00',
          '#000000',
          '#00FF00',
          '#000000',
          '#00FF00',
    ]
    const wheelOptions = {
      rewards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      colors:colors,
      knobSize: 50,
      borderWidth: 5,
      borderColor: "#000",
      innerRadius: 50,
      duration: 4000,
      backgroundColor: "white",
      textAngle: "horizontal",
      knobSource: require("./assets/images/knob.png"),
      
      onRef: (ref) => (this.child = ref),
    };
    return (
      <View
        style={{
          flex: 1,
          height: screenHeigth,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#070A27",
        }}
      >
        {this.state.loading ? (
          <View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "white",
              justifyContent: "flex-end",
            }}
          >
            <PantallaCarga></PantallaCarga>
            <View
              style={{
                width: "100%",
                height: screenHeigth / 7,
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
              }}
            >
              <Text
                style={{
                  fontSize: screenWidth / 30,
                  color: "black",
                  letterSpacing: 1.5,
                  marginTop: "2%",
                }}
              >
                {this.state.loadingtext}
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={{
              width: screenWidth,
              height: screenHeigth,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#070A27",
            }}
          >
            <View
              style={{
                width: "80%",
                height: "15%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: screenWidth / 20,
                  fontWeight: "bold",
                }}
              >
                {"Adivina el color para descubrir la mejor oferta de hoy."}
              </Text>
            </View>
            <View
              style={{
                width: "80%",
                height: "60%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <WheelOfFortune options={wheelOptions} getWinner={
                (value,index)=>{
                  if((this.state.valor && value % 2 == 0 )||(!this.state.valor && value % 2 !==0)){
                    this.RegisterRoullete(true);
                  }else{
                    this.RegisterRoullete(false);
                  }
                }
              } />
            </View>
            <View
              style={{
                width: "90%",
                height: "20%",
                justifyContent: "space-evenly",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <TouchableHighlight
                style={{
                  width: "40%",
                  height: "30%",
                  borderWidth: 1,
                  borderColor: "white",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "black",
                  borderRadius: screenWidth / 35,
                }}
                onPress={() => {
                  this.setState({ valor: false });
                  this.child._onPress();
                }}
              >
                <View>
                  <Text style={{ color: "white", textAlign: "center" }}>
                    {"Negro"}
                  </Text>
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                style={{
                  width: "40%",
                  height: "30%",
                  borderWidth: 1,
                  borderColor: "white",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "red",
                  borderRadius: screenWidth / 35,
                }}
                onPress={() => {
                  this.setState({ valor: true });
                  this.child._onPress();
                }}
              >
                <View>
                  <Text style={{ color: "white", textAlign: "center" }}>
                    {"Rojo"}
                  </Text>
                </View>
              </TouchableHighlight>
            </View>
          </View>
        )}
      </View>
    );
  }
}
