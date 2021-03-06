import React from "react"
import Axios from "axios"
import { withRouter, Switch, Route } from "react-router-dom"
import PropTypes from "prop-types"
import "../../../start/styles.css"
import {
  Typography,
  Toolbar,
  AppBar,
  CssBaseline,
  Divider,
  List,
  IconButton,
  Hidden,
  Drawer,
  ListItemText,
  ListItemIcon,
  ListItem,
  // Badge
} from "@material-ui/core"
import {
  Menu as MenuIcon,
  // LocationOn
} from "@material-ui/icons"
import { makeStyles, useTheme } from "@material-ui/core/styles"
import { FaHome, FaHistory, FaHotjar, FaRegSun,FaUsers } from "react-icons/fa"
import { RiLogoutCircleLine } from "react-icons/ri"
import { AiFillMessage } from 'react-icons/ai'
import Chat from '../../chat/Chat'
import Browsing from '../../browsing/browsing'
import Home from "../../profil/Home"
import EditProfil from "../../profil/editProfill"
import Setting from "../../profil/setting"
import History from "../../history/history"
import AllProfil from "../../allProfil/likeProfil"
import SocketContext from "../../../start/SocketContext";
import Notifications from "../../Notifications/Notifications";
import MessageNotification from "../../Notifications/MessageNotification";
import IdContext from "../../../start/IdContext"

const instance = Axios.create({ withCredentials: true });

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    display: "flex",
  },
  ty: {
    flexGrow: 1,
    fontFamily: "Comfortaa",
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

const ResponsiveDrawer = (props) => {
  const { history, window } = props
  const classes = useStyles()
  const theme = useTheme()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [id, setId] = React.useState(0)
  const [lat, setLat] = React.useState(false)
  const [long, setLong] = React.useState(false)
  const [requiredProfilInfo, setRPI] = React.useState('')
  const [didMount, setDidMount] = React.useState(false)
  const [err, setErr] = React.useState(false)
  const socket = React.useContext(SocketContext);

  const [userInf, setUserInf] = React.useState({});


  React.useEffect(() => {
    socket.emit('join', { key: userInf.id });
  }, [userInf, id])

  function isEmpty(obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false;
      }
    }

    return true
  }

  const saveMyInfos = (value) => {
    if (isEmpty(userInf) === true)
      setUserInf(value);
  }
  console.log('3333333', userInf)
  React.useEffect(() => {
    if (id) {

      Axios.post('http://localhost:3001/chat/getConnectedUserInfos', { userId: id })
        .then((res) => {
          // if(!MyInfos)
          if (res) {
            saveMyInfos(res.data.myInfos);
          }

        }).catch((err) => { console.log(err) })
    }
  }, [id])
////////////////////////////////////////////////////////////////////////////////////////////////
  function success(pos) {
    setErr(false)
    setLat(pos.coords.latitude)
    setLong(pos.coords.longitude)
    if (id1) navigator.geolocation.clearWatch(id1)
  }

  const options = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 0,
  }

  let id1 = navigator.geolocation.getCurrentPosition(success, () => {setErr(true)}, options)

  const func = React.useCallback(async () => {
    if (!didMount){
      const CancelToken = Axios.CancelToken
      const source = CancelToken.source()
        let { data } = await instance.get('http://localhost:3001/base', {
          cancelToken: source.token,
        })
        setId(data.user.id)
      return () => {
        if (source) source.cancel('test')
      }
    }
  }, [didMount])

  const func1 = React.useCallback(async () => {
    console.log(id)
    if (id !== 0) {
      console.log("TEST")
      await instance.post('http://localhost:3001/user/userInfoVerification', { userId: id }).then((res) => {
        console.log(res.data)
        if (res.data.status === true) {
            setRPI(true)
          } else setRPI(false)
        }).catch(err => {
          console.log(err)
        })
        console.log("TEST222")
    }
  },[id])

  React.useEffect(() => {
    func()
    func1()
    setDidMount(true)
    return () => {
      setDidMount(false)
    }
  }, [func, func1])

  const getLocIp = React.useCallback(() => {
    // get locallization with help of ip
    Axios.post(`/base/checkLoc/${id}`).then(res => {
      if (res.data.status && err){
        Axios.get('https://api.ipify.org?format=json').then(async (res) => {
          await Axios.get(`http://ip-api.com/json/${res.data.ip}`).then((res) => {
            setLat(res.data.lat)
            setLong(res.data.lon)
          })
          if (id) Axios.post(`base/localisation/${id}`, { lat: lat, long: long })
        })
      }
    })
  }, [id, lat, long, err])

  React.useEffect(() => {
    // tal l push
    if (lat === false && long === false)
      getLocIp()
  }, [lat, long, getLocIp])

  React.useEffect(() => {
    Axios.post(`/base/checkLoc/${id}`).then(res => {
      if (res.data.status){
        if (lat !== false && long !== false && id)
          Axios.post(`base/localisation/${id}`, { lat: lat, long: long })
      }
    })
    
    setDidMount(true)
    return () => {
      setDidMount(false)
    }
  }, [id, lat, long])

  const handelLogout = () => {
    instance.post('http://localhost:3001/logout')
    if(id){
      socket.emit('Firedisconnect', {id : id})
    }
    // socket.close();
  }
  socket.on('fire', (data) => {
    console.log('****'+data.id ,id)
    if(data.id == id)
    {
      props.logout()
    }
  })

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const itemsListOne = [
    {
      id: 0,
      text: 'Home',
      icon: <FaHome />,
      onClick: () => history.push('/'),
      hidden: true,
      disabled: requiredProfilInfo,
    },
    {
      id: 1,
      text: 'browsing',
      icon: <FaHotjar />,
      onClick: () => history.push(`/browsing/${id}`),
      disabled: !requiredProfilInfo,
    },
    {
      id: 3,
      text: 'Setting',
      icon: <FaRegSun />,
      onClick: () => history.push(`/edit/${id}`),
      disabled: !requiredProfilInfo,
    },
    {
      id: 4,
      text: 'History',
      icon: <FaHistory />,
      onClick: () => history.push(`/history/${id}`),
      disabled: !requiredProfilInfo,
    },
    {
      id: 5,
      text: 'Profil',
      icon: <FaUsers />,
      onClick: () => history.push('/allProfil'),
      disabled: !requiredProfilInfo,
    },
    {
      id: 6,
      text: 'Chat',
      icon: <AiFillMessage />,
      onClick: () => history.push('/chat'),
      disabled: !requiredProfilInfo,
    },
  ]
  const itemsListTwo = [
    {
      id: 100,
      text: 'Logout',
      icon: <RiLogoutCircleLine />,
      onClick: () => {
        handelLogout()
      },
    },
  ]
  const drawer = (
    <div>
      <div className={classes.toolbar} />
      <Divider />
      <List key={Math.random()}>
        {itemsListOne.map((item, index) => {
          const { id, text, icon, onClick, disabled, hidden } = item
          if (!hidden) {
            return (
              <ListItem button key={id} disabled={disabled} onClick={onClick}>
                <ListItemText key={id + Math.random()} primary={text} />
                {icon && <ListItemIcon>{icon}</ListItemIcon>}
              </ListItem>
            )
          }
          return <React.Fragment key={Math.random()}></React.Fragment>
        })}
      </List>
      <Divider />
      <List key={Math.random()}>
        {itemsListTwo.map((item, index) => {
          const { id, text, icon, onClick } = item
          return (
            <ListItem button key={id} onClick={onClick}>
              <ListItemText key={id + Math.random()} primary={text} />
              {icon && <ListItemIcon>{icon}</ListItemIcon>}
            </ListItem>
          )
        })}
      </List>
    </div>
  )

  const container =
    window !== undefined ? () => window().document.body : undefined

  if (!didMount) {
    return null
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position='fixed' className={classes.appBar}>
        <Toolbar>
          <IconButton
            color='secondary'
            aria-label='open drawer'
            edge='start'
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography className={classes.ty} variant='h6' noWrap>
            Matcha
          </Typography>
          <MessageNotification myInfos={userInf} />
          <Notifications myInfos={userInf} />
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label='mailbox folders'>
        <Hidden smUp implementation='css'>
          <Drawer
            container={container}
            variant='temporary'
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true,
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation='css'>
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant='permanent'
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Switch>
          <IdContext.Provider value={id}>
            <Route
              exact
              path='/edit/:id'
              render={(props) => <EditProfil id={id} />}
            />
            <Route exact path='/chat' render={(props) => <Chat id={id} />} />
            <Route
              exact
              path='/browsing/:id'
              render={(props) => <Browsing id={id} />}
            />
            <Route exact path='/history/:id' component={History} />
            <Route
              exact
              path='/setting'
              component={(props) => <Setting id={id} />}
            />
            <Route
              exact
              path='/allProfil'
              component={(props) => <AllProfil id={id} />}
            />
            {requiredProfilInfo === true ? (
              <Route exact path='/' render={(props) => <Browsing id={id}  myInfos={userInf} />} />
            ) : (
              <Route exact path='/*' render={(props) => <Home id={id} />} />
            )}
          </IdContext.Provider>
        </Switch>
      </main>
    </div>
  )
};

ResponsiveDrawer.propTypes = {
  window: PropTypes.func,
};

export default withRouter(ResponsiveDrawer);
