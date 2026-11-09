pub fn encode_base64(bytes: &[u8]) -> String {
    const TABLE: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::with_capacity(bytes.len().div_ceil(3) * 4);
    for chunk in bytes.chunks(3) {
        let b0 = chunk[0];
        let b1 = if chunk.len() > 1 { chunk[1] } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] } else { 0 };

        out.push(TABLE[(b0 >> 2) as usize] as char);
        out.push(TABLE[(((b0 & 0x03) << 4) | (b1 >> 4)) as usize] as char);
        if chunk.len() > 1 {
            out.push(TABLE[(((b1 & 0x0f) << 2) | (b2 >> 6)) as usize] as char);
        } else {
            out.push('=');
        }
        if chunk.len() > 2 {
            out.push(TABLE[(b2 & 0x3f) as usize] as char);
        } else {
            out.push('=');
        }
    }
    out
}

pub fn decode_base64(input: &str) -> Result<Vec<u8>, String> {
    const TABLE: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut decode_table = [255u8; 256];
    for (i, &b) in TABLE.iter().enumerate() {
        decode_table[b as usize] = i as u8;
    }

    let clean: Vec<u8> = input
        .bytes()
        .filter(|&b| b != b'=' && b != b'\r' && b != b'\n' && b != b' ')
        .collect();
    let mut out = Vec::with_capacity((clean.len() * 3) / 4);

    for chunk in clean.chunks(4) {
        let mut buf = [0u8; 4];
        for (i, &b) in chunk.iter().enumerate() {
            let val = decode_table[b as usize];
            if val == 255 {
                return Err("Caractere Base64 inválido".to_string());
            }
            buf[i] = val;
        }

        if chunk.len() >= 2 {
            out.push((buf[0] << 2) | (buf[1] >> 4));
        }
        if chunk.len() >= 3 {
            out.push(((buf[1] & 0x0f) << 4) | (buf[2] >> 2));
        }
        if chunk.len() == 4 {
            out.push(((buf[2] & 0x03) << 6) | buf[3]);
        }
    }

    Ok(out)
}
