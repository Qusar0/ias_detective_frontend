import { AuthAPI } from "../api/AuthAPI"

export const AuthModule = {
    namespaced: true,

    state() {
        return {
            credentials: {
                token: localStorage.getItem('token') || null,
                userRole: localStorage.getItem('userRole') || null,
                userId: localStorage.getItem('userId') || null,
            }
        }
    },

    getter: {
        getUserRole: (state) => state.credentials.userRole
    },

    mutations: {
        setToken(state, token) {
            state.credentials.token = token
            localStorage.setItem('token', token)
        },
        setUserRole(state, userRole) {
            state.credentials.userRole = userRole
            localStorage.setItem('userRole', userRole)
        },
        deleteToken(state) {
            state.credentials.token = null
            localStorage.removeItem('token')
        },
        deleteUserRole(state) {
            state.credentials.userRole = null
            localStorage.removeItem('userRole')
        },
        setUserId(state, userId){
            state.credentials.userId = userId
            localStorage.setItem('userId', userId)
        },
        deleteUserId(state) {
            state.credentials.userId = null
            localStorage.removeItem('userId')
        }
    },

    actions: {
        onLogin({commit}, {login, password}) {
            AuthAPI
                .login({ login, password })
                .then((res) => {
                    commit('setToken', res.data.token)
                    commit('setUserRole', res.data.userRole)
                    commit('userId', res.data.user_id)
            })
        },
        onLogout() {
            commit('deleteToken')
            commit('deleteUserRole')
            commit('deleteUserId')
        },
    }
}