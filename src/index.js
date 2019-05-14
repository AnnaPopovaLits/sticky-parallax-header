import React, { Component } from 'react'
import { Animated, ScrollView, View, TouchableOpacity, Text } from 'react-native'
import { func, number, node, arrayOf, string } from 'prop-types'
import styles from './styles'

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)

class StickyParalaxHeader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      nScroll: new Animated.Value(0),
      scrollHeight: 65
    }
  }

  componentDidMount() {
    const { nScroll } = this.state
    // eslint-disable-next-line
    nScroll.addListener(({ value }) => (this._value = value))
  }

  componentWillUnmount() {
    const { nScroll } = this.state
    nScroll.removeListener()
  }

  onScrollEndSnapToEdge = (event) => {
    const { headerHeight, parallaxHeight } = this.props
    const { y } = event.nativeEvent.contentOffset
    const backgroundHeight = Math.max(parallaxHeight, headerHeight * 2)
    const scrollHeight = backgroundHeight - headerHeight
    if (y > 0 && y < scrollHeight / 2) {
      this.scroll.getNode().scrollTo({ x: 0, y: 0, animate: true })
    } else if (scrollHeight / 2 <= y) {
      this.scroll.getNode().scrollTo({ x: 0, y: backgroundHeight, animate: true })
    }
  }

  isCloseToBottom({ layoutMeasurement, contentOffset, contentSize }) {
    const { onEndReached } = this.props

    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
      onEndReached()
    }
  }

  renderTabs = () => {
    const { tabs } = this.props
    const shouldRenderTabs = tabs && tabs.length > 0

    return shouldRenderTabs ? (
      <View style={styles.tabsContainer}>
        <TouchableOpacity activeOpacity={0.75} style={styles.tab}>
          <Text style={styles.tabText}>{tabs[0]}</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.75} style={styles.tab}>
          <Text style={styles.tabText}>{tabs[1]}</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.75} style={styles.tab}>
          <Text style={styles.tabText}>{tabs[2]}</Text>
        </TouchableOpacity>
      </View>
    ) : (
        <View style={styles.tabsContainer} />
      )
  }

  renderHeader = () => {
    const { headerHeight, header } = this.props
    const { nScroll, scrollHeight } = this.state
    const titleOpacity = nScroll.interpolate({
      inputRange: [0, scrollHeight],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    })

    return (
      <View style={[styles.toolbar, { height: headerHeight }]}>
        <Animated.View style={[styles.toolbarWrapper, { height: headerHeight }]}>
          <Animated.View
            style={[
              styles.titleWrapper,
              {
                opacity: titleOpacity
              }
            ]}
          >
            {header}
          </Animated.View>
        </Animated.View>
      </View>
    )
  }

  render() {
    const { headerHeight, header, foreground, children, parallaxHeight } = this.props
    const { nScroll, scrollHeight } = this.state

    const backgroundHeight = Math.max(parallaxHeight, headerHeight * 2)

    const headerBorderRadius = nScroll.interpolate({
      inputRange: [0, scrollHeight],
      outputRange: [70, 0],
      extrapolate: 'extend'
    })

    return (
      <View style={styles.container}>
        <AnimatedScrollView
          bounces={false}
          ref={(c) => {
            this.scroll = c
          }}
          onScrollEndDrag={event => this.onScrollEndSnapToEdge(event)}
          scrollEventThrottle={1}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: nScroll } } }], {
            useNativeDriver: true,
            listener: event => this.isCloseToBottom(event.nativeEvent)
          })}
        >
          <Animated.View
            style={{
              transform: [{ translateY: Animated.multiply(nScroll, 0.1) }]
            }}
          >
            <Animated.View
              style={[
                styles.headerStyle,
                {
                  height: backgroundHeight,
                  borderBottomRightRadius: headerBorderRadius
                }
              ]}
            >
              <View style={{ height: backgroundHeight, paddingTop: headerHeight }}>
                {foreground}
                {this.renderTabs()}
              </View>
            </Animated.View>
          </Animated.View>
          {children}
        </AnimatedScrollView>
        {header && this.renderHeader()}
      </View>
    )
  }
}

StickyParalaxHeader.propTypes = {
  onEndReached: func,
  foreground: node,
  header: node,
  headerHeight: number,
  parallaxHeight: number,
  children: node,
  tabs: arrayOf(string)
}

StickyParalaxHeader.defaultProps = {
  headerHeight: 70,
  parallaxHeight: 0
}

export default StickyParalaxHeader
