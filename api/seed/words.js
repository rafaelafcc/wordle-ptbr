require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'wordle',
});

const words = [
  'MUNDO', 'PORTA', 'TERRA', 'PLANO', 'FELIZ',
  'LINDO', 'BOLAS', 'CAMPO', 'GENTE', 'LIVRO',
  'FALAR', 'PODER', 'TEMPO', 'LUGAR', 'NOITE',
  'VERDE', 'CLARO', 'FORTE', 'PERTO', 'LONGE',
  'BARCO', 'FOLHA', 'PEDRA', 'CHAVE', 'SONHO',
  'FESTA', 'CONTA', 'GRUPO', 'FORMA', 'PASSO',
  'LINHA', 'PONTO', 'CARTA', 'METAL', 'CERTO',
  'GRAVE', 'BRAVO', 'TOTAL', 'FINAL', 'NIVEL',
  'VALOR', 'MOTOR', 'RAIVA', 'CALMA', 'POSSE',
  'CORPO', 'BRAÇO', 'DENTE', 'PULSO', 'ROSTO',
  'COISA', 'PARTE', 'MENTE', 'PLENA', 'TRATO',
  'PLACA', 'GRADE', 'CERCA', 'LARGO', 'CURTO',
  'DIGNO', 'FIRME', 'MACIO', 'TENSO', 'CALOR',
  'FUNDO', 'CASAL', 'MEDIR', 'COLAR', 'PARAR',
  'FUGIR', 'SUBIR', 'MEXER', 'VIVER', 'COMER',
  'BEBER', 'LUTAR', 'ACHAR', 'OLHAR', 'PISAR',
  'BOTAR', 'TIRAR', 'JOGAR', 'PUXAR', 'CORAR',
  'LIGAR', 'VOLTO', 'SALTO', 'PALCO', 'DANCE',
  'VENTO', 'NUVEM', 'CHUVA', 'GRAMA', 'FLORE',
  'PRAIA', 'AREIA', 'ONDAS', 'MARAL', 'CORAL',
  'TIGRE', 'LEBRE', 'LOUCA', 'TRIBO', 'NATAL',
  'MORAL', 'PAPEL', 'LAPSO', 'CARGO', 'TERNO',
  'BOLSA', 'SINAL', 'MILHO', 'TRIGO', 'ARROZ',
  'LIMPO', 'SUJOS', 'SABIA', 'DOIDO', 'CRISE',
  'FRASE', 'TEXTO', 'DRAMA', 'PALHA', 'MORRO',
  'BARRO', 'FERRO', 'VIDRO', 'TELHA', 'PAUSA',
  'TORTA', 'BALDE', 'RENDA', 'DANOS', 'LUCRO',
  'PERDA', 'GANHO', 'SORTE', 'CRIME', 'MOVER',
  'AGORA', 'MESMO', 'OUTRO', 'DESDE', 'ENTRE',
  'ACIMA', 'ABRIR', 'BAIXO', 'CAUDA', 'DEDOS',
  'ELEVA', 'FUMAR', 'GRITO', 'HONRA', 'IDEAL',
  'JUSTO', 'LEVAR', 'NOBRE', 'OUVIR', 'PILAR',
  'QUASE', 'SETOR', 'TUMOR', 'ULTRA', 'VIGOR',
  'ZEBRA', 'AMINO', 'BEIRA', 'COFRE', 'DIABO',
  'ESTOU', 'FICAR', 'GESSO', 'HIATO', 'ISCAR',
  'JATOS', 'LANCE', 'METRO', 'NERVO', 'OPACO',
  'POSTE', 'RUGAS', 'SUTIL', 'TURMA', 'USUAL',
  'VAPOR', 'XARPE', 'ALUNO', 'BICHO', 'CIPRE',
  'DEVIR', 'ETAPA', 'FOSCO', 'GRUTA', 'HAVER',
  'IMUNE', 'JULHO', 'LEITE', 'MARÇO', 'NOSSO',
  'ORDEM', 'PALMA', 'QUEDA', 'RECUO', 'SENSO',
  'TOQUE', 'UNHAS', 'VULTO', 'ABALO', 'BECOS',
  'CACHO', 'DADOS', 'ERVAS', 'FAUNA', 'GLOBO',
  'HUMOR', 'JAULA', 'LAPIZ', 'MOLHO', 'NINHO',
  'OSSOS', 'POLIR', 'QUEIO', 'ROCHA', 'SALSA',
  'TRAPO', 'USINA', 'VAZIO', 'ADUBO', 'BUSCA',
  'CASCO', 'DUPLA', 'EXATO', 'FIBRA', 'GARFO',
  'HEROI', 'ILESO', 'JUNTA', 'LACRE', 'MANTA',
  'NEGAR', 'OASIS', 'PISCO', 'QUOTA', 'RALAR',
  'SABOR', 'TAIPA', 'URSOS', 'VODCA', 'ANEXO',
  'BLOCO', 'CEDER', 'DIGNA', 'ENVIO', 'FARSA',
  'GATOS', 'HASTE', 'ICONE', 'JUDIO', 'LAGOA',
  'MOEDA', 'NARIZ', 'OMBRO', 'PATAS', 'RELVA',
  'SALDO', 'TERSO', 'UNIDO', 'VALSA', 'ACASO',
  'BISPO', 'COLAR', 'DOCES', 'EXAME', 'FRACO',
  'GALHO', 'ILHAS', 'JEITO', 'LOTAR', 'MALHA',
  'NINFA', 'OSTRA', 'PIADA', 'RAMPA', 'SURDO',
  'TECLA', 'VEADO', 'ARAME', 'BRISA', 'CISNE',
  'DUNAS', 'ERETO', 'FAIXA', 'GRILO', 'HINOS',
  'IRMOS', 'JOGOS', 'LOTES', 'MIOLO', 'NAVIO',
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const word of words) {
      await client.query(
        'INSERT INTO words (word) VALUES ($1) ON CONFLICT (word) DO NOTHING',
        [word]
      );
    }

    await client.query('COMMIT');
    console.log(`Seeded ${words.length} words successfully.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
