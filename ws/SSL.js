let socketFactory;

function loadCertificates() {
    let certificates = ["ISRGRootX1.cer"];
    const KeyStore = Java.type("java.security.KeyStore"),
        Paths = Java.type("java.nio.file.Paths"),
        System = Java.type("java.lang.System"),
        Files = Java.type("java.nio.file.Files"),
        CertificateFactory = Java.type("java.security.cert.CertificateFactory"),
        JavaString = Java.type("java.lang.String"),
        ByteArrayInputStream = Java.type("java.io.ByteArrayInputStream"),
        TrustManagerFactory = Java.type("javax.net.ssl.TrustManagerFactory"),
        SSLContext = Java.type("javax.net.ssl.SSLContext");
    let keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
    let ksPath = Paths.get(System.getProperty("java.home"), "lib", "security", "cacerts");
    keyStore.load(Files.newInputStream(ksPath), new JavaString("changeit").toCharArray());
    let cf = CertificateFactory.getInstance("X.509");
    for (let i of certificates) {
        let pathStr = `${Config.modulesFolder}/kuudraiscool/ws/certificates/${i}`;
        let path = Paths.get(pathStr);
        let data = Files.readAllBytes(path);
        let cert = cf.generateCertificate(new ByteArrayInputStream(data));
        keyStore.setCertificateEntry("dev.semisol.letsencryptsupport:" + i, cert);
    }
    let tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
    tmf.init(keyStore);
    let sslContext = SSLContext.getInstance("TLS");
    sslContext.init(null, tmf.getTrustManagers(), null);
    SSLContext.setDefault(sslContext);
    socketFactory = sslContext.getSocketFactory();
}

loadCertificates();

export { socketFactory }
