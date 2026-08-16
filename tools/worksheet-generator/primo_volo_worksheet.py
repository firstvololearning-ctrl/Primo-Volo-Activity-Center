from pathlib import Path
from math import ceil
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
WORKSHEET_DIR = ROOT / "images" / "worksheets" / "clothingworksheet"
CLOTHING_DIR = ROOT / "images" / "clothing"

OUT = WORKSHEET_DIR / "Vestiti_Worksheet.pdf"
PREVIEW = WORKSHEET_DIR / "vestiti-worksheet-preview.png"

PAGE_W, PAGE_H = letter
M = 36
BLUE = HexColor('#174f88')
MID_BLUE = HexColor('#3b75b6')
PALE_BLUE = HexColor('#eef7ff')
PALE_BLUE_2 = HexColor('#e6f3ff')
GREEN = HexColor('#3c9c57')
GOLD = HexColor('#d8a216')
PALE_GOLD = HexColor('#fff8df')
TEXT = HexColor('#25374a')
MUTED = HexColor('#718096')
LINE = HexColor('#8db4d8')

# Fonts
for name, path in [
    ('DejaVu', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'),
    ('DejaVuBold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'),
]:
    if Path(path).exists():
        pdfmetrics.registerFont(TTFont(name, path))
FONT = 'DejaVu' if 'DejaVu' in pdfmetrics.getRegisteredFontNames() else 'Helvetica'
BOLD = 'DejaVuBold' if 'DejaVuBold' in pdfmetrics.getRegisteredFontNames() else 'Helvetica-Bold'

items = [
    ('il pigiama', 'clothes-01.png'),
    ('la maglietta', 'clothes-02.png'),
    ('la camicia', 'clothes-03.png'),
    ('la felpa', 'clothes-04.png'),
    ('il maglione', 'clothes-05.png'),
    ('il cappotto', 'clothes-06.png'),
    ('la giacca', 'clothes-07.png'),
    ('i pantaloncini', 'clothes-08.png'),
    ('la gonna', 'clothes-09.png'),
    ('i calzini', 'clothes-10.png'),
    ('la sciarpa', 'clothes-11.png'),
    ('i guanti', 'clothes-12.png'),
    ('il cappello', 'clothes-13.png'),
    ('gli occhiali', 'clothes-14.png'),
    ('le scarpe', 'clothes-15.png'),
    ('gli stivali', 'clothes-16.png'),
    ('il costume da bagno', 'clothes-17.png'),
    ('la cintura', 'clothes-18.png'),
    ('il vestito', 'clothes-19.png'),
    ('i pantaloni', 'clothes-20.png'),
]
lookup = {k: CLOTHING_DIR / v for k, v in items}


def round_rect(c, x, y, w, h, fill=PALE_BLUE, stroke=LINE, radius=8, sw=0.7):
    c.setLineWidth(sw)
    c.setStrokeColor(stroke)
    c.setFillColor(fill)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)


def draw_image(c, path, x, y, w, h, pad=3):
    path = Path(path)
    with Image.open(path) as im:
        iw, ih = im.size
    scale = min((w - 2*pad)/iw, (h - 2*pad)/ih)
    dw, dh = iw*scale, ih*scale
    dx = x + (w-dw)/2
    dy = y + (h-dh)/2
    c.drawImage(ImageReader(str(path)), dx, dy, dw, dh, mask='auto', preserveAspectRatio=True)


def text(c, x, y, s, size=9, font=FONT, color=TEXT):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawString(x, y, s)


def centered(c, x, y, w, s, size=9, font=FONT, color=TEXT):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawCentredString(x+w/2, y, s)


def header(c, title, number, subtitle):
    text(c, M, PAGE_H-38, "Primo Volo d'Italiano", 9.5, BOLD, BLUE)
    c.setFont(BOLD, 12)
    c.setFillColor(GREEN)
    c.drawRightString(PAGE_W-M, PAGE_H-38, 'I vestiti')
    c.setStrokeColor(BLUE)
    c.setLineWidth(0.6)
    c.line(M, PAGE_H-43, PAGE_W-M, PAGE_H-43)
    text(c, M, PAGE_H-67, f'{number}. {title}', 17, BOLD, BLUE)
    text(c, M, PAGE_H-80, subtitle, 6.4, FONT, MUTED)


def footer(c, page_no):
    c.setStrokeColor(HexColor('#d8e4ef'))
    c.setLineWidth(0.5)
    c.line(M, 28, PAGE_W-M, 28)
    text(c, M, 17, '© 2026 Alexis Sacco / First Volo Learning  |  firstvololearning.com', 5.5, FONT, MUTED)
    c.setFont(FONT, 5.5); c.setFillColor(MUTED); c.drawRightString(PAGE_W-M, 17, str(page_no))


def radio(c, x, y, label):
    c.setStrokeColor(BLUE); c.setLineWidth(0.7); c.circle(x, y+1.5, 2.2, fill=0, stroke=1)
    text(c, x+7, y-0.5, label, 6.3, FONT, TEXT)


def tile(c, x, y, label):
    c.setFont(BOLD, 7.2)
    width = max(32, c.stringWidth(label, BOLD, 7.2)+14)
    c.setFillColor(white); c.setStrokeColor(BLUE); c.setLineWidth(0.8)
    c.roundRect(x, y, width, 19, 5, fill=1, stroke=1)
    centered(c, x, y+5.5, width, label, 7.2, BOLD, BLUE)
    return width


def page1(c):
    header(c, 'Scegli e abbina', 1, 'Meet all 20 clothing words: choose the correct word, then match.')
    text(c, M, PAGE_H-99, 'Nome:', 6.5, BOLD)
    c.setStrokeColor(MUTED); c.line(M+30, PAGE_H-101, M+170, PAGE_H-101)
    text(c, PAGE_W-206, PAGE_H-99, 'Data:', 6.5, BOLD)
    c.line(PAGE_W-174, PAGE_H-101, PAGE_W-M, PAGE_H-101)

    text(c, M, PAGE_H-121, 'A. Scegli la parola corretta.', 7.2, BOLD, TEXT)
    text(c, 247, PAGE_H-121, 'Choose the correct word.', 6.0, FONT, MUTED)

    quiz = [
        ('il pigiama', ['il pigiama','la maglietta','il cappotto']),
        ('la maglietta', ['la camicia','la maglietta','la felpa']),
        ('la camicia', ['la camicia','la giacca','il maglione']),
        ('la felpa', ['la felpa','il maglione','la maglietta']),
        ('il maglione', ['il maglione','il cappotto','la felpa']),
        ('il cappotto', ['il cappotto','la giacca','il maglione']),
        ('la giacca', ['la giacca','il cappotto','la camicia']),
        ('i pantaloncini', ['i pantaloncini','i pantaloni','i calzini']),
        ('la gonna', ['la gonna','il vestito','la cintura']),
        ('i calzini', ['i calzini','le scarpe','i guanti']),
    ]
    x0, gap, cw, ch = M, 16, 252, 53
    y_top = PAGE_H-137
    for idx,(word, opts) in enumerate(quiz):
        col = idx % 2; row = idx // 2
        x = x0 + col*(cw+gap); y = y_top - (row+1)*ch - row*5
        round_rect(c,x,y,cw,ch,PALE_BLUE,LINE,7,0.6)
        draw_image(c,lookup[word],x+6,y+4,55,ch-8)
        oy=y+34
        for j,opt in enumerate(opts): radio(c,x+72,oy-j*12,opt)

    text(c, M, 337, 'B. Abbina. Scrivi la lettera corretta.', 7.2, BOLD, TEXT)
    text(c, 270, 337, 'Match. Write the correct letter.', 6.0, FONT, MUTED)

    match_words = ['la sciarpa','i guanti','il cappello','gli occhiali','le scarpe','gli stivali','il costume da bagno','la cintura','il vestito','i pantaloni']
    bx, by, bw, bh, bgap = M, 252, 100, 67, 8
    for idx,word in enumerate(match_words):
        col=idx%5; row=idx//5
        x=bx+col*(bw+bgap); y=by-row*(bh+8)
        round_rect(c,x,y,bw,bh,white,LINE,6,0.6)
        text(c,x+5,y+bh-11,f'{idx+1}.',5.7,BOLD,BLUE)
        draw_image(c,lookup[word],x+20,y+21,bw-40,bh-25)
        text(c,x+6,y+6,'Lettera:',5.1,FONT,MUTED)
        c.setStrokeColor(MUTED); c.line(x+33,y+7,x+bw-7,y+7)

    # word bank bottom
    y=86
    round_rect(c,M,y,PAGE_W-2*M,72,PALE_GOLD,GOLD,7,0.8)
    text(c,M+10,y+57,'Parole',7,BOLD,BLUE)
    bank = [
        ('A.','il costume da bagno'),('B.','gli occhiali'),('C.','la sciarpa'),('D.','i pantaloni'),('E.','le scarpe'),
        ('F.','il cappello'),('G.','la cintura'),('H.','gli stivali'),('I.','i guanti'),('J.','il vestito')
    ]
    for i,(letter,word) in enumerate(bank):
        col=i%5; row=i//5
        xx=M+10+col*105; yy=y+39-row*19
        text(c,xx,yy,letter,5.5,BOLD,BLUE)
        text(c,xx+13,yy,word,5.3,FONT,TEXT)
    footer(c,1)


def page2(c):
    header(c, 'Completa', 2, 'Use each picture and sentence frame. Then complete the missing letters.')
    text(c,M,PAGE_H-104,"A. Guarda l'immagine e completa la frase.",7.3,BOLD)
    text(c,M,PAGE_H-116,'Look at the image and write the correct clothing phrase.',6.0,FONT,MUTED)

    bank_words=['la sciarpa','i guanti','il cappello','le scarpe','il vestito','i pantaloni']
    round_rect(c,M,PAGE_H-147,PAGE_W-2*M,24,PALE_GOLD,GOLD,6,0.8)
    text(c,M+10,PAGE_H-139,'Banca delle parole:',6.0,BOLD,BLUE)
    text(c,M+112,PAGE_H-139,'  |  '.join(bank_words),5.7,FONT,TEXT)

    row_y=PAGE_H-202
    for i,w in enumerate(bank_words):
        y=row_y-i*52
        round_rect(c,M,y,PAGE_W-2*M,42,PALE_BLUE,LINE,6,0.6)
        draw_image(c,lookup[w],M+8,y+3,47,36)
        text(c,M+70,y+15,'Io indosso...',7.0,BOLD,BLUE)
        c.setStrokeColor(MUTED); c.line(M+150,y+14,PAGE_W-M-14,y+14)
        text(c,PAGE_W-M-10,y+13,'.',8,BOLD,TEXT)

    text(c,M,320,'B. Completa la parola.',7.3,BOLD)
    text(c,285,320,'Complete the word.',6.0,FONT,MUTED)
    miss=[('il p_giama','il pigiama'),('il magl_one','il maglione'),('gli occh_ali','gli occhiali'),('la cint_ra','la cintura')]
    cw=123; gap=10; y=218
    for i,(pattern,word) in enumerate(miss):
        x=M+i*(cw+gap)
        round_rect(c,x,y,cw,88,white,LINE,6,0.6)
        draw_image(c,lookup[word],x+18,y+38,cw-36,42)
        centered(c,x,y+26,cw,pattern,6.5,BOLD,TEXT)
        text(c,x+7,y+8,'Scrivi:',5.2,FONT,MUTED)
        c.setStrokeColor(MUTED); c.line(x+37,y+9,x+cw-8,y+9)
    footer(c,2)


def page3(c):
    header(c, 'Assembla le frasi', 3, 'Put the tiles in order. Then write the complete sentence.')
    text(c,M,PAGE_H-105,'Metti le tessere nell\'ordine giusto. Poi scrivi la frase completa.',7.2,BOLD)
    text(c,M,PAGE_H-118,'Put the tiles in the correct order. Then write the complete sentence.',6.0,FONT,MUTED)

    rows=[
        ('la maglietta',['maglietta','la','Io indosso...']),
        ('il cappotto',['cappotto','il','Mi piace...']),
        ('i pantaloni',['pantaloni','i','Io indosso...']),
        ('le scarpe',['Io indosso...','scarpe','le']),
        ('il vestito',['vestito','Mi piace...','il']),
    ]
    y0=PAGE_H-226
    for idx,(word,tiles) in enumerate(rows):
        y=y0-idx*103
        round_rect(c,M,y,PAGE_W-2*M,89,PALE_BLUE if idx%2==0 else PALE_BLUE_2,LINE,7,0.6)
        text(c,M+7,y+74,f'{idx+1}.',5.8,BOLD,BLUE)
        draw_image(c,lookup[word],M+25,y+30,78,51)
        tx=M+115
        for lab in tiles:
            tw=tile(c,tx,y+52,lab); tx+=tw+8
        text(c,M+115,y+31,'Scrivi qui:',5.3,FONT,MUTED)
        c.setStrokeColor(MUTED); c.line(M+115,y+18,PAGE_W-M-18,y+18)
    footer(c,3)


def page4(c):
    header(c, 'Scrivi una frase', 4, 'Choose a sentence starter and write a complete sentence about each picture.')
    text(c,M,PAGE_H-105,'Banca delle frasi',7.2,BOLD,TEXT)
    text(c,142,PAGE_H-105,'Sentence-starter bank',6.0,FONT,MUTED)

    # starter boxes
    sy=PAGE_H-176; sw=(PAGE_W-2*M-18)/2
    for i,label in enumerate(['Io indosso...','Mi piace...']):
        x=M+i*(sw+18)
        round_rect(c,x,sy,sw,58,white,BLUE,7,1.0)
        centered(c,x,sy+22,sw,label,9.0,BOLD,BLUE)

    text(c,M,PAGE_H-201,'Scegli un inizio e scrivi una frase completa.',7.0,BOLD)
    text(c,M,PAGE_H-213,'Choose a starter and write a complete sentence.',6.0,FONT,MUTED)

    writing=['la camicia','il cappello','il vestito','i pantaloni']
    y0=PAGE_H-326
    for idx,w in enumerate(writing):
        y=y0-idx*116
        round_rect(c,M,y,PAGE_W-2*M,100,white if idx%2==0 else PALE_BLUE,LINE,7,0.6)
        text(c,M+8,y+84,f'{idx+1}.',5.8,BOLD,BLUE)
        draw_image(c,lookup[w],M+35,y+15,110,72)
        c.setStrokeColor(MUTED); c.line(M+185,y+50,PAGE_W-M-20,y+50)
    footer(c,4)


def build():
    WORKSHEET_DIR.mkdir(parents=True, exist_ok=True)
    c=canvas.Canvas(str(OUT), pagesize=letter)
    c.setTitle('I vestiti - Primo Volo d\'Italiano')
    for fn in (page1,page2,page3,page4):
        fn(c); c.showPage()
    c.save()
    print(OUT)

if __name__=='__main__':
    build()
