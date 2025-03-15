import Cookies from 'js-cookie'

const TokenKey = 'vue_admin_template_token'
const TokenNameKey = 'vue_admin_template_token_name'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getTokenName() {
  return Cookies.get(TokenNameKey)
}

export function setTokenName(tokenName) {
  return Cookies.set(TokenNameKey, tokenName)
}
