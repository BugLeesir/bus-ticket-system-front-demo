import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken, getTokenName, setTokenName } from '@/utils/auth'
import { resetRouter } from '@/router'
import { encryptPassword } from '@/utils/encrypt'

const getDefaultState = () => {
  return {
    token: getToken(),
    tokenName: getTokenName(),
    name: '',
    avatar: '',
    roles: []
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_TOKEN_NAME: (state, tokenName) => {
    state.tokenName = tokenName
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      // 加密密码
      login({ username: username.trim(), password: encryptPassword(password) }).then(res => {
        console.log(res)
        commit('SET_TOKEN', res.data.token)
        commit('SET_TOKEN_NAME', res.data.tokenName)
        setToken(res.data.token)
        setTokenName(res.data.tokenName)
        // 输出token测试
        console.log(res.data.token, res.data.tokenName)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(res => {
        if (!res) {
          return reject('Verification failed, please Login again.')
        }
        // const { username, avatar, roles } = data
        const username = res.data.username
        const avatar = require('@/assets/avatar/avatar.png')
        const roles = res.data.roles
        const data = res.data
        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }

        commit('SET_NAME', username)
        commit('SET_AVATAR', avatar)
        commit('SET_ROLES', roles)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

