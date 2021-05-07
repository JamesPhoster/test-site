$(document).ready(function () {
    AOS.init();

    $(window).scroll(function () {
        var scrollY = window.scrollY;
        var windowHeight = window.innerHeight;
        var windowWidth = window.innerWidth;
        var wayOffsetTop = $(".roadmap .roadmap-wayContent").offset().top
        var top = wayOffsetTop - (windowHeight / 2)

        if (scrollY > top) {
            $(".roadmap .roadmap-wayContent").addClass('roadmap-wayContent-animate')

            if (windowWidth < 769) {
                var height = 0;

                $('.roadmap-way1 .roadmap-milestone, .roadmap-way2 .roadmap-milestone').each(function () {
                    if (!$(this).hasClass('roadmap-milestone-current')) {
                        height += $(this).height() + 25
                    }
                });

                $(".roadmap-wayContextWay").animate({
                    height: `${height}px`
                }, {
                    duration: 4000,
                    easing: "linear"
                })
            }
        }
    })

    var ticketSlider = $('.tickets-slider');

    ticketSlider.owlCarousel({
        loop: true,
        responsiveClass: true,
        nav: false,
        autoWidth: true,
        autoplay: false,
        autoplayTimeout: 5000,
        autoplayHoverPause: false,
        mouseDrag: false,
        responsive: {
            0: {
                items: 1,
            },
            1000: {
                items: 2,
            }
        }
    })

    $('.ticketsSlider-button-next').click(function () {
        ticketSlider.trigger('next.owl.carousel');
    })

    $('.ticketsSlider-button-back').click(function () {
        ticketSlider.trigger('prev.owl.carousel');
    })

    function setFirstChildActive() {
        ticketSlider.find('.tickets-sliderItem-active').removeClass('tickets-sliderItem-active')
        console.log(ticketSlider.find('.owl-item.active').first())
        ticketSlider.find('.owl-item.active').first().find('.tickets-sliderItem').addClass('tickets-sliderItem-active')
    }

    setFirstChildActive()
    ticketSlider.on('changed.owl.carousel', function () {
        setTimeout(function () {
            setFirstChildActive()
        }, 100)
    });

    var teamSlider = $('.team-slider');

    teamSlider.owlCarousel({
        loop: true,
        center: true,
        margin: 120,
        responsiveClass: true,
        nav: false,
        autoWidth: true,
        responsive: {
            0: {
                items: 1,
            },
            768: {
                margin: 20,
                items: 2,
            },
            1440: {
                items: 3,
            }
        }
    })

    $('.team-sliderButton-next').click(function () {
        teamSlider.trigger('next.owl.carousel');
    })

    $('.team-sliderButton-back').click(function () {
        teamSlider.trigger('prev.owl.carousel');
    })


    $.timer = function (el) {
        var time = $(el).data("timer")
        var date1 = new Date();
        var date2 = new Date(time);
        var difference = date2.getTime() - date1.getTime();
        var differenceDays = difference / (1000 * 3600 * 24);
        var differenceHours = difference / (1000 * 3600);
        var differenceMinutes = difference / (1000 * 60);

        var days = parseInt(differenceDays)
        var hours = parseInt(differenceHours) - (days * 24)
        var minutes = parseInt(differenceMinutes) - (hours * 60) - (days * 24 * 60)

        $(el).find('.day').html(days)
        $(el).find('.hour').html(hours)
        $(el).find('.minute').html(minutes)
    }

    $('[data-timer]').map(function () {
        $.timer(this)
        setInterval(() => $.timer(this), 1000);
    })
})

const denom = a => parseFloat((a / 1e6).toFixed(2))

var app = new Vue({
    el: '#app',
    data: {
        address: '',
        staked: 0,
        winrBalance: 0,
        message: '',
        winrAddress: 'TKeuUeXkEh9FbDNzhzEYi6K7RzNX7Zqpuk',
        winrTransferAddress: 'TEcbUSXbjsaCu19aA8fHZZdNrJELZP1GCu',
        ercAddress: '',
        error: ''
    },
    mounted: function () {
        setTimeout(async () => {
            await this.initTron();
        }, 3000);
    },
    methods: {
        initTron: async function () {
            if (typeof window.tronWeb !== 'undefined' && window.tronWeb) {
                const address = window.tronWeb.defaultAddress.base58
                this.$set(this, 'address', address);
                this.winrContract = await window.tronWeb.contract().at(this.winrAddress)
                this.setAmounts();
            }
        },
        setAmounts: async function () {
            const staked = await this.winrContract.stakeOf(this.address).call()
            const winrBalance = await this.winrContract.balanceOf(this.address).call()

            this.$set(this, 'staked', denom(staked[0]));
            this.$set(this, 'winrBalance', denom(winrBalance));
        },
        unstake: async function () {
            await this.winrContract.unstake().send()
            this.setAmounts();
        },
        transfer: async function () {
            if (!this.address) {
                return this.$set(this, 'error', 'trcAddress')
            }

            if (!this.ercAddress) {
                return this.$set(this, 'error', 'ercAddress')
            }
            const winrBalance = await this.winrContract.balanceOf(this.address).call()

            this.$set(this, 'error', '')
            axios.post('https://wallet-api.just.bet/wallet', {
                trcWallet: this.address,
                amount: this.winrBalance,
                ercWallet: this.ercAddress,
            }).then(async ({data}) => {
                if (data.id) {
                    await this.winrContract.transfer(this.winrTransferAddress, 10000000).send()
                    this.setAmounts();
                    this.$set(this, 'message', 'Transaction sent!')
                }
            })
        }
    }
})
