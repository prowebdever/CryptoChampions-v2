
import MediumIcon from '../../components/Icons/MediumIcon'
// import TelegramIcon from '../../components/Icons/TelegramIcon'
import TwitterIcon from '../../components/Icons/TwitterIcon'
// import EmailIcon from '../../components/Icons/EmailIcon'
import OpenseaIcon from '../../components/Icons/OpenseaIcon'
import DiscordIcon from '../../components/Icons/DiscordIcon'

const FOOTER_MENUS = [
    {
        id: 'twitter',
        icon: <TwitterIcon />,
        url: 'https://twitter.com/planetk9nft?s=21'
    },
    {
        id: 'discord',
        icon: <DiscordIcon />,
        url: 'https://discord.gg/gASbm4YqQG'
    },
    {
        id: 'medium',
        icon: <MediumIcon />,
        url: 'https://planetk9nft.medium.com/',
    },
    {
        id: 'opensea',
        icon: <OpenseaIcon />,
        url: 'https://opensea.io/'
    }
];

export {
    FOOTER_MENUS
}