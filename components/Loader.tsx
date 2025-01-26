import styles from './Loader.module.scss';

export default function Loader(
    {background}: {background: string}
) {
    return (
        <div className={styles.spinner}>
            <div style={{background}} />
            <div style={{background}} />
            <div style={{background}} />
            <div style={{background}} />
            <div style={{background}} />
            <div style={{background}} />
            <div style={{background}} />
            <div style={{background}} />
            <div style={{background}} />
            <div style={{background}} />
            <div style={{background}} />
            <div style={{background}} />
        </div>
    );
}
