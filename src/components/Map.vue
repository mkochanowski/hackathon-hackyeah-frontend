<template>
  <div>
    <div id="map"></div>
  </div>
</template>

<style>
#map {
  height: calc(100vh - 56px);
  width: 100%;
  background-color: #cc555555;
}
.markers-label {
  font-size: 20px;
  background: #fff;
  border-radius: 100px;
  padding: 4px;
}
</style>

<script>
import Vue from 'vue'
import DataService from '../dataservice.js'
import Info from './Info.vue'

export default {
  data() {
    return {
      offers: {},
      tooltip: null,
      markers: [],
    }
  },
  mounted: function () {
    var self = this;
    this.$store.bus.$on('snap-to-and-open', function(e) {
      self.snapToAndOpen(e)
    })
    this.$store.bus.$on('refresh-map', function(e) {
      self.refreshMap(e)
    })
    this.fetchOffers()
  },
  methods: {
    initMap: function () {
      console.log("initMap()")
      var center = { lat: 50.0646501, lng: 19.9449799 };
      this.map = new google.maps.Map(document.getElementById('map'), {
        gestureHandling: "greedy",
        zoom: 13,
        center: center,
        mapTypeControl: false
      })

      var self = this
      if (false && navigator.geolocation) {
        this.$emit('in-progress-dialog', true)
        console.log('geo emitted')

        map = this.map
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          console.log(pos)
          
          // this.infoWindow.setPosition(pos);
          // this.infoWindow.setContent('Location found.');
          // this.infoWindow.open(this.map);
          
          map.panTo(pos);
          map.setZoom(15);
          google.maps.event.addListenerOnce(map, 'idle', function(){
              self.$emit('in-progress-dialog', false)
          });
        }, function() {
          console.log('geolocation is not supported 1')
          self.$emit('in-progress-dialog', false)
          // handleLocationError(true, infoWindow, map.getCenter());
        });
      } else {
          console.log('geolocation is not supported 2')
          self.$emit('in-progress-dialog', false)
          // Browser doesn't support Geolocation
          // handleLocationError(false, infoWindow, map.getCenter());
      }
    },
    fetchOffers: function () {
      this.offers = this.$store.getOffers().then((s) => {
        this.offers = s
        this.initMap()
        this.populateOffers()
      }).catch(e => console.log);
    },
    snapToAndOpen: function(el) {
      let marker = this.markers[el.ID]
      this.map.panTo(marker.position)
      let vu = new Vue({
        extends: Info,
        el: document.createElement('div'),
        propsData: {item: el},
      });
      if (this.tooltip) {
       this.tooltip.close();
      }
      this.tooltip = new google.maps.InfoWindow({
        content: vu.$el.outerHTML
      });
      this.tooltip.open(this.map, marker);
    },
    refreshMap: function() {
      let map = this.map;
      window.setTimeout(function() {
        google.maps.event.trigger(this.map, "resize");
      }, 300)
    },
    populateOffers: function () {
      var self = this;
      for (let i in this.offers) {
        let item = this.offers[i]
        var map = this.map
        
        let latLng = new google.maps.LatLng(item['latitude'], item['longitude']);

        let price = item['picture']
        var color = "#222"
        var opacity = 0.3
        var scale = 7
        var short_date = Number(item['CreatedAt'].substring(8, 10))

        let marker = new MarkerWithLabel({
          position: latLng,
          map: this.map,
          clickable: true,
          title: item['title'],
          labelContent: item['picture'],
          labelClass: "markers-label",
          labelAnchor: new google.maps.Point(5, 5),
          icon: {
            path: '',
            scale: scale,
            strokeWeight: 4,
            strokeColor: "#fff",
            fillColor: color,
            fillOpacity: opacity
          },
        });
        this.markers[item.ID] = marker;


        google.maps.event.addListener(marker, 'click', function () {
          let vu = new Vue({
            extends: Info,
            el: document.createElement('div'),
            propsData: {item: item},
          });
          map.panTo(this.position);
          map.setZoom(15);
          if (self.tooltip) {
            self.tooltip.close();
          }
          self.tooltip = new google.maps.InfoWindow({
            content: vu.$el.outerHTML
          });
          self.tooltip.open(map, this);
        })
      }
    }
  }
}
</script>