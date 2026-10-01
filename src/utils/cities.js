// JagaKota — basis kota v2: tabel kompak + turunan objek (hemat diff, cepat parse)
export const REGIONS = ['Semua','Jawa','Sumatera','Kalimantan','Sulawesi','Bali & Nusa Tenggara','Maluku & Papua','Nusantara'];
// name|province|region, lat, lon
const _TABEL = [
  ["Banda Aceh|Aceh|Sumatera",5.5483,95.3238], // jk-1
  ["Sabang|Aceh|Sumatera",5.8933,95.3214], // jk-2
  ["Lhokseumawe|Aceh|Sumatera",5.1801,97.1407], // jk-3
  ["Langsa|Aceh|Sumatera",4.4719,97.9683], // jk-4
  ["Subulussalam|Aceh|Sumatera",2.75,98], // jk-5
  ["Aceh Besar (Jantho)|Aceh|Sumatera",5.2858,95.59], // jk-6
  ["Pidie (Sigli)|Aceh|Sumatera",5.3833,95.95], // jk-7
  ["Pidie Jaya (Meureudu)|Aceh|Sumatera",5.25,96.1667], // jk-8
  ["Bireuen|Aceh|Sumatera",5.2,96.7], // jk-9
  ["Aceh Utara (Lhoksukon)|Aceh|Sumatera",5.0441,97.3186], // jk-10
  ["Aceh Timur (Idi Rayeuk)|Aceh|Sumatera",4.9667,97.7667], // jk-11
  ["Aceh Tamiang (Karang Baru)|Aceh|Sumatera",4.25,98.0333], // jk-12
  ["Bener Meriah (Simpang Tiga Redelong)|Aceh|Sumatera",4.7333,96.8833], // jk-13
  ["Aceh Tengah (Takengon)|Aceh|Sumatera",4.63,96.84], // jk-14
  ["Gayo Lues (Blangkejeren)|Aceh|Sumatera",3.9833,97.35], // jk-15
  ["Aceh Tenggara (Kutacane)|Aceh|Sumatera",3.4833,97.8167], // jk-16
  ["Aceh Jaya (Calang)|Aceh|Sumatera",4.6333,95.5833], // jk-17
  ["Aceh Barat (Meulaboh)|Aceh|Sumatera",4.1449,96.1285], // jk-18
  ["Nagan Raya (Suka Makmue)|Aceh|Sumatera",4.1667,96.3333], // jk-19
  ["Aceh Barat Daya (Blangpidie)|Aceh|Sumatera",3.75,96.8333], // jk-20
  ["Aceh Selatan (Tapaktuan)|Aceh|Sumatera",3.25,97.1833], // jk-21
  ["Aceh Singkil (Singkil)|Aceh|Sumatera",2.3333,97.8333], // jk-22
  ["Simeulue (Sinabang)|Aceh|Sumatera",2.4833,96.3833], // jk-23
  ["Medan|Sumatera Utara|Sumatera",3.5952,98.6722], // jk-24
  ["Binjai|Sumatera Utara|Sumatera",3.6008,98.4854], // jk-25
  ["Tebing Tinggi|Sumatera Utara|Sumatera",3.3285,99.1626], // jk-26
  ["Pematangsiantar|Sumatera Utara|Sumatera",2.9592,99.0687], // jk-27
  ["Tanjungbalai|Sumatera Utara|Sumatera",2.9667,99.8], // jk-28
  ["Sibolga|Sumatera Utara|Sumatera",1.7426,98.7792], // jk-29
  ["Padangsidimpuan|Sumatera Utara|Sumatera",1.3733,99.2731], // jk-30
  ["Gunungsitoli|Sumatera Utara|Sumatera",1.2894,97.6148], // jk-31
  ["Deli Serdang (Lubuk Pakam)|Sumatera Utara|Sumatera",3.5592,98.8753], // jk-32
  ["Langkat (Stabat)|Sumatera Utara|Sumatera",3.75,98.45], // jk-33
  ["Karo (Kabanjahe)|Sumatera Utara|Sumatera",3.1,98.4833], // jk-34
  ["Dairi (Sidikalang)|Sumatera Utara|Sumatera",2.75,98.3167], // jk-35
  ["Pakpak Bharat (Salak)|Sumatera Utara|Sumatera",2.5667,98.2833], // jk-36
  ["Simalungun (Raya)|Sumatera Utara|Sumatera",2.9667,98.8667], // jk-37
  ["Asahan (Kisaran)|Sumatera Utara|Sumatera",2.9833,99.6333], // jk-38
  ["Batu Bara (Limapuluh)|Sumatera Utara|Sumatera",3.1667,99.5333], // jk-39
  ["Labuhanbatu (Rantau Prapat)|Sumatera Utara|Sumatera",2.0833,99.8333], // jk-40
  ["Labuhanbatu Utara (Aek Kanopan)|Sumatera Utara|Sumatera",2.5667,99.65], // jk-41
  ["Labuhanbatu Selatan (Kota Pinang)|Sumatera Utara|Sumatera",1.9,100.0833], // jk-42
  ["Tapanuli Utara (Tarutung)|Sumatera Utara|Sumatera",2.0167,98.9667], // jk-43
  ["Tapanuli Tengah (Pandan)|Sumatera Utara|Sumatera",1.6833,98.8333], // jk-44
  ["Tapanuli Selatan (Sipirok)|Sumatera Utara|Sumatera",1.6,99.2667], // jk-45
  ["Toba (Balige)|Sumatera Utara|Sumatera",2.3333,99.0667], // jk-46
  ["Samosir (Pangururan)|Sumatera Utara|Sumatera",2.6,98.7], // jk-47
  ["Humbang Hasundutan (Dolok Sanggul)|Sumatera Utara|Sumatera",2.2667,98.75], // jk-48
  ["Mandailing Natal (Panyabungan)|Sumatera Utara|Sumatera",0.8667,99.5667], // jk-49
  ["Padang Lawas (Sibuhuan)|Sumatera Utara|Sumatera",1.0667,99.7833], // jk-50
  ["Padang Lawas Utara (Gunung Tua)|Sumatera Utara|Sumatera",1.4833,99.6333], // jk-51
  ["Serdang Bedagai (Sei Rampah)|Sumatera Utara|Sumatera",3.4833,99.15], // jk-52
  ["Nias (Gido)|Sumatera Utara|Sumatera",1.1167,97.75], // jk-53
  ["Nias Selatan (Teluk Dalam)|Sumatera Utara|Sumatera",0.55,97.85], // jk-54
  ["Nias Utara (Lotu)|Sumatera Utara|Sumatera",1.3333,97.3167], // jk-55
  ["Nias Barat (Lahomi)|Sumatera Utara|Sumatera",1.05,97.45], // jk-56
  ["Padang|Sumatera Barat|Sumatera",-0.9471,100.4172], // jk-57
  ["Bukittinggi|Sumatera Barat|Sumatera",-0.3056,100.3692], // jk-58
  ["Payakumbuh|Sumatera Barat|Sumatera",-0.2244,100.6309], // jk-59
  ["Pariaman|Sumatera Barat|Sumatera",-0.6264,100.1206], // jk-60
  ["Solok|Sumatera Barat|Sumatera",-0.7964,100.6558], // jk-61
  ["Padang Panjang|Sumatera Barat|Sumatera",-0.4639,100.3986], // jk-62
  ["Sawahlunto|Sumatera Barat|Sumatera",-0.6806,100.7761], // jk-63
  ["Agam (Lubuk Basung)|Sumatera Barat|Sumatera",-0.3,100.0333], // jk-64
  ["Lima Puluh Kota (Sarilamak)|Sumatera Barat|Sumatera",-0.1333,100.6667], // jk-65
  ["Pasaman (Lubuk Sikaping)|Sumatera Barat|Sumatera",0.15,100.1667], // jk-66
  ["Pasaman Barat (Simpang Empat)|Sumatera Barat|Sumatera",0.1,99.8], // jk-67
  ["Tanah Datar (Batusangkar)|Sumatera Barat|Sumatera",-0.45,100.5833], // jk-68
  ["Padang Pariaman (Parit Malintang)|Sumatera Barat|Sumatera",-0.6333,100.2833], // jk-69
  ["Pesisir Selatan (Painan)|Sumatera Barat|Sumatera",-1.35,100.5667], // jk-70
  ["Kab. Solok (Arosuka)|Sumatera Barat|Sumatera",-0.9333,100.6167], // jk-71
  ["Solok Selatan (Padang Aro)|Sumatera Barat|Sumatera",-1.4833,101.2167], // jk-72
  ["Dharmasraya (Pulau Punjung)|Sumatera Barat|Sumatera",-0.9833,101.6167], // jk-73
  ["Sijunjung (Muaro Sijunjung)|Sumatera Barat|Sumatera",-0.6833,101], // jk-74
  ["Kepulauan Mentawai (Tuapejat)|Sumatera Barat|Sumatera",-2.0167,99.6], // jk-75
  ["Pekanbaru|Riau|Sumatera",0.5071,101.4478], // jk-76
  ["Dumai|Riau|Sumatera",1.6833,101.45], // jk-77
  ["Kampar (Bangkinang)|Riau|Sumatera",0.3333,101.0333], // jk-78
  ["Siak (Siak Sri Indrapura)|Riau|Sumatera",0.8,102.05], // jk-79
  ["Pelalawan (Pangkalan Kerinci)|Riau|Sumatera",0.4,101.85], // jk-80
  ["Indragiri Hulu (Rengat)|Riau|Sumatera",-0.3667,102.55], // jk-81
  ["Indragiri Hilir (Tembilahan)|Riau|Sumatera",-0.3167,103.15], // jk-82
  ["Bengkalis|Riau|Sumatera",1.4833,102.1333], // jk-83
  ["Rokan Hulu (Pasir Pengaraian)|Riau|Sumatera",0.8667,100.3167], // jk-84
  ["Rokan Hilir (Bagansiapiapi)|Riau|Sumatera",2.1667,100.8167], // jk-85
  ["Kuantan Singingi (Teluk Kuantan)|Riau|Sumatera",-0.5333,101.5667], // jk-86
  ["Kepulauan Meranti (Selatpanjang)|Riau|Sumatera",1.0167,102.7], // jk-87
  ["Batam|Kepulauan Riau|Sumatera",1.1301,104.0529], // jk-88
  ["Tanjungpinang|Kepulauan Riau|Sumatera",0.9167,104.45], // jk-89
  ["Bintan (Bandar Seri Bentan)|Kepulauan Riau|Sumatera",1.1667,104.5833], // jk-90
  ["Karimun (Tanjung Balai Karimun)|Kepulauan Riau|Sumatera",1.0833,103.4333], // jk-91
  ["Natuna (Ranai)|Kepulauan Riau|Sumatera",3.95,108.3833], // jk-92
  ["Kepulauan Anambas (Tarempa)|Kepulauan Riau|Sumatera",3.2167,106.2167], // jk-93
  ["Lingga (Daik)|Kepulauan Riau|Sumatera",-0.2,104.6167], // jk-94
  ["Kota Jambi|Jambi|Sumatera",-1.6101,103.6131], // jk-95
  ["Sungai Penuh|Jambi|Sumatera",-2.0667,101.4], // jk-96
  ["Batanghari (Muara Bulian)|Jambi|Sumatera",-1.7167,103.2833], // jk-97
  ["Bungo (Muara Bungo)|Jambi|Sumatera",-1.5,102.1167], // jk-98
  ["Kerinci (Siulak)|Jambi|Sumatera",-1.9833,101.2667], // jk-99
  ["Merangin (Bangko)|Jambi|Sumatera",-2.0667,102.2667], // jk-100
  ["Muaro Jambi (Sengeti)|Jambi|Sumatera",-1.4167,103.65], // jk-101
  ["Sarolangun|Jambi|Sumatera",-2.3,102.65], // jk-102
  ["Tanjung Jabung Barat (Kuala Tungkal)|Jambi|Sumatera",-0.8167,103.4667], // jk-103
  ["Tanjung Jabung Timur (Muara Sabak)|Jambi|Sumatera",-1.1333,103.8667], // jk-104
  ["Tebo (Muara Tebo)|Jambi|Sumatera",-1.4833,102.4], // jk-105
  ["Kota Bengkulu|Bengkulu|Sumatera",-3.8004,102.2655], // jk-106
  ["Bengkulu Selatan (Manna)|Bengkulu|Sumatera",-4.4667,102.9], // jk-107
  ["Bengkulu Tengah (Karang Tinggi)|Bengkulu|Sumatera",-3.75,102.4333], // jk-108
  ["Bengkulu Utara (Arga Makmur)|Bengkulu|Sumatera",-3.4333,102.1833], // jk-109
  ["Kaur (Bintuhan)|Bengkulu|Sumatera",-4.75,103.35], // jk-110
  ["Kepahiang|Bengkulu|Sumatera",-3.65,102.5833], // jk-111
  ["Lebong (Tubei)|Bengkulu|Sumatera",-3.15,102.2833], // jk-112
  ["Mukomuko|Bengkulu|Sumatera",-2.5833,101.1167], // jk-113
  ["Rejang Lebong (Curup)|Bengkulu|Sumatera",-3.4667,102.5333], // jk-114
  ["Seluma (Tais)|Bengkulu|Sumatera",-4.0833,102.55], // jk-115
  ["Palembang|Sumatera Selatan|Sumatera",-2.9761,104.7754], // jk-116
  ["Prabumulih|Sumatera Selatan|Sumatera",-3.4316,104.2344], // jk-117
  ["Pagar Alam|Sumatera Selatan|Sumatera",-4.0278,103.2667], // jk-118
  ["Lubuklinggau|Sumatera Selatan|Sumatera",-3.2958,102.8617], // jk-119
  ["Banyuasin (Pangkalan Balai)|Sumatera Selatan|Sumatera",-2.8833,104.3833], // jk-120
  ["Empat Lawang (Tebing Tinggi)|Sumatera Selatan|Sumatera",-3.6167,103.0833], // jk-121
  ["Lahat|Sumatera Selatan|Sumatera",-3.7833,103.5333], // jk-122
  ["Muara Enim|Sumatera Selatan|Sumatera",-3.65,103.7667], // jk-123
  ["Musi Banyuasin (Sekayu)|Sumatera Selatan|Sumatera",-2.8833,103.8333], // jk-124
  ["Musi Rawas (Muara Beliti)|Sumatera Selatan|Sumatera",-3.25,103.0333], // jk-125
  ["Musi Rawas Utara (Rupit)|Sumatera Selatan|Sumatera",-2.7167,102.8667], // jk-126
  ["Ogan Ilir (Indralaya)|Sumatera Selatan|Sumatera",-3.2333,104.65], // jk-127
  ["Ogan Komering Ilir (Kayu Agung)|Sumatera Selatan|Sumatera",-3.4,104.8333], // jk-128
  ["Ogan Komering Ulu (Baturaja)|Sumatera Selatan|Sumatera",-4.1333,104.1667], // jk-129
  ["OKU Selatan (Muaradua)|Sumatera Selatan|Sumatera",-4.5167,104.05], // jk-130
  ["OKU Timur (Martapura)|Sumatera Selatan|Sumatera",-4.3167,104.35], // jk-131
  ["Penukal Abab Lematang Ilir - PALI (Talang Ubi)|Sumatera Selatan|Sumatera",-3.2833,103.85], // jk-132
  ["Pangkalpinang|Kepulauan Bangka Belitung|Sumatera",-2.1333,106.1167], // jk-133
  ["Bangka (Sungailiat)|Kepulauan Bangka Belitung|Sumatera",-1.8667,106.1167], // jk-134
  ["Bangka Barat (Muntok)|Kepulauan Bangka Belitung|Sumatera",-2.0667,105.1667], // jk-135
  ["Bangka Tengah (Koba)|Kepulauan Bangka Belitung|Sumatera",-2.4833,106.4], // jk-136
  ["Bangka Selatan (Toboali)|Kepulauan Bangka Belitung|Sumatera",-3.0167,106.45], // jk-137
  ["Belitung (Tanjung Pandan)|Kepulauan Bangka Belitung|Sumatera",-2.7333,107.6333], // jk-138
  ["Belitung Timur (Manggar)|Kepulauan Bangka Belitung|Sumatera",-2.8833,108.2667], // jk-139
  ["Bandar Lampung|Lampung|Sumatera",-5.45,105.2667], // jk-140
  ["Metro|Lampung|Sumatera",-5.1139,105.3067], // jk-141
  ["Lampung Selatan (Kalianda)|Lampung|Sumatera",-5.7333,105.5833], // jk-142
  ["Lampung Tengah (Gunung Sugih)|Lampung|Sumatera",-4.95,105.2167], // jk-143
  ["Lampung Utara (Kotabumi)|Lampung|Sumatera",-4.8333,104.8833], // jk-144
  ["Lampung Barat (Liwa)|Lampung|Sumatera",-5.0333,104.0667], // jk-145
  ["Lampung Timur (Sukadana)|Lampung|Sumatera",-5.1,105.55], // jk-146
  ["Pesawaran (Gedong Tataan)|Lampung|Sumatera",-5.4333,105.1], // jk-147
  ["Pringsewu|Lampung|Sumatera",-5.3583,104.975], // jk-148
  ["Tanggamus (Kota Agung)|Lampung|Sumatera",-5.5,104.6167], // jk-149
  ["Tulang Bawang (Menggala)|Lampung|Sumatera",-4.55,105.25], // jk-150
  ["Tulang Bawang Barat (Panaragan Jaya)|Lampung|Sumatera",-4.4333,105.05], // jk-151
  ["Way Kanan (Blambangan Umpu)|Lampung|Sumatera",-4.5,104.5333], // jk-152
  ["Mesuji (Wiralaga Mulya)|Lampung|Sumatera",-4.0167,105.4], // jk-153
  ["Pesisir Barat (Krui)|Lampung|Sumatera",-5.1833,103.9333], // jk-154
  ["Jakarta Pusat|DKI Jakarta|Jawa",-6.1805,106.8284], // jk-155
  ["Jakarta Selatan|DKI Jakarta|Jawa",-6.2615,106.8106], // jk-156
  ["Jakarta Timur|DKI Jakarta|Jawa",-6.225,106.9004], // jk-157
  ["Jakarta Barat|DKI Jakarta|Jawa",-6.1683,106.7589], // jk-158
  ["Jakarta Utara|DKI Jakarta|Jawa",-6.1214,106.7741], // jk-159
  ["Kepulauan Seribu (Pulau Pramuka)|DKI Jakarta|Jawa",-5.7472,106.6139], // jk-160
  ["Serang|Banten|Jawa",-6.12,106.1503], // jk-161
  ["Cilegon|Banten|Jawa",-6.0174,106.0538], // jk-162
  ["Tangerang|Banten|Jawa",-6.1783,106.6319], // jk-163
  ["Tangerang Selatan (BSD/Serpong)|Banten|Jawa",-6.2886,106.7179], // jk-164
  ["Kab. Tangerang (Tigaraksa)|Banten|Jawa",-6.2611,106.48], // jk-165
  ["Kab. Serang (Ciruas)|Banten|Jawa",-6.1333,106.2167], // jk-166
  ["Lebak (Rangkasbitung)|Banten|Jawa",-6.35,106.25], // jk-167
  ["Pandeglang|Banten|Jawa",-6.3083,106.1067], // jk-168
  ["Bandung|Jawa Barat|Jawa",-6.9175,107.6191], // jk-169
  ["Bekasi|Jawa Barat|Jawa",-6.2383,106.9756], // jk-170
  ["Bogor|Jawa Barat|Jawa",-6.595,106.8167], // jk-171
  ["Depok|Jawa Barat|Jawa",-6.4025,106.7942], // jk-172
  ["Cimahi|Jawa Barat|Jawa",-6.8722,107.5422], // jk-173
  ["Cirebon|Jawa Barat|Jawa",-6.732,108.5523], // jk-174
  ["Sukabumi|Jawa Barat|Jawa",-6.9277,106.9297], // jk-175
  ["Tasikmalaya|Jawa Barat|Jawa",-7.3274,108.2207], // jk-176
  ["Banjar|Jawa Barat|Jawa",-7.3711,108.535], // jk-177
  ["Kab. Bandung (Soreang)|Jawa Barat|Jawa",-7.0314,107.5186], // jk-178
  ["Bandung Barat (Ngamprah)|Jawa Barat|Jawa",-6.84,107.5], // jk-179
  ["Kab. Bekasi (Cikarang)|Jawa Barat|Jawa",-6.3,107.1667], // jk-180
  ["Kab. Bogor (Cibinong)|Jawa Barat|Jawa",-6.48,106.85], // jk-181
  ["Ciamis|Jawa Barat|Jawa",-7.325,108.35], // jk-182
  ["Cianjur|Jawa Barat|Jawa",-6.8222,107.1394], // jk-183
  ["Kab. Cirebon (Sumber)|Jawa Barat|Jawa",-6.7667,108.4833], // jk-184
  ["Garut (Tarogong)|Jawa Barat|Jawa",-7.2167,107.9], // jk-185
  ["Indramayu|Jawa Barat|Jawa",-6.3264,108.32], // jk-186
  ["Karawang|Jawa Barat|Jawa",-6.3072,107.3089], // jk-187
  ["Kuningan|Jawa Barat|Jawa",-6.9767,108.4833], // jk-188
  ["Majalengka|Jawa Barat|Jawa",-6.8361,108.2278], // jk-189
  ["Pangandaran (Parigi)|Jawa Barat|Jawa",-7.7,108.4833], // jk-190
  ["Purwakarta|Jawa Barat|Jawa",-6.5569,107.4433], // jk-191
  ["Subang|Jawa Barat|Jawa",-6.5714,107.76], // jk-192
  ["Kab. Sukabumi (Palabuhanratu)|Jawa Barat|Jawa",-6.9833,106.55], // jk-193
  ["Sumedang|Jawa Barat|Jawa",-6.8586,107.9267], // jk-194
  ["Kab. Tasikmalaya (Singaparna)|Jawa Barat|Jawa",-7.35,108.1167], // jk-195
  ["Semarang|Jawa Tengah|Jawa",-6.9667,110.4167], // jk-196
  ["Surakarta (Solo)|Jawa Tengah|Jawa",-7.5755,110.8243], // jk-197
  ["Magelang|Jawa Tengah|Jawa",-7.4706,110.2178], // jk-198
  ["Pekalongan|Jawa Tengah|Jawa",-6.8886,109.6753], // jk-199
  ["Salatiga|Jawa Tengah|Jawa",-7.3306,110.5083], // jk-200
  ["Tegal|Jawa Tengah|Jawa",-6.8694,109.1403], // jk-201
  ["Banjarnegara|Jawa Tengah|Jawa",-7.3972,109.6967], // jk-202
  ["Banyumas (Purwokerto)|Jawa Tengah|Jawa",-7.4244,109.23], // jk-203
  ["Batang|Jawa Tengah|Jawa",-6.9083,109.7333], // jk-204
  ["Blora|Jawa Tengah|Jawa",-6.97,111.4183], // jk-205
  ["Boyolali|Jawa Tengah|Jawa",-7.5333,110.5967], // jk-206
  ["Brebes|Jawa Tengah|Jawa",-6.8708,109.0431], // jk-207
  ["Cilacap|Jawa Tengah|Jawa",-7.7186,109.0153], // jk-208
  ["Demak|Jawa Tengah|Jawa",-6.8944,110.6389], // jk-209
  ["Grobogan (Purwodadi)|Jawa Tengah|Jawa",-7.0867,110.9167], // jk-210
  ["Jepara|Jawa Tengah|Jawa",-6.5917,110.6694], // jk-211
  ["Karanganyar|Jawa Tengah|Jawa",-7.5967,110.9517], // jk-212
  ["Kebumen|Jawa Tengah|Jawa",-7.6717,109.6583], // jk-213
  ["Kendal|Jawa Tengah|Jawa",-6.92,110.2039], // jk-214
  ["Klaten|Jawa Tengah|Jawa",-7.7036,110.6033], // jk-215
  ["Kudus|Jawa Tengah|Jawa",-6.8047,110.8406], // jk-216
  ["Pati|Jawa Tengah|Jawa",-6.7558,111.0378], // jk-217
  ["Pemalang|Jawa Tengah|Jawa",-6.8917,109.3806], // jk-218
  ["Purbalingga|Jawa Tengah|Jawa",-7.3889,109.3639], // jk-219
  ["Purworejo|Jawa Tengah|Jawa",-7.7167,110.0167], // jk-220
  ["Rembang|Jawa Tengah|Jawa",-6.7083,111.3417], // jk-221
  ["Kab. Semarang (Ungaran)|Jawa Tengah|Jawa",-7.1394,110.4039], // jk-222
  ["Sragen|Jawa Tengah|Jawa",-7.4267,111.0217], // jk-223
  ["Sukoharjo|Jawa Tengah|Jawa",-7.6833,110.8333], // jk-224
  ["Kab. Tegal (Slawi)|Jawa Tengah|Jawa",-6.9833,109.1333], // jk-225
  ["Temanggung|Jawa Tengah|Jawa",-7.3167,110.1767], // jk-226
  ["Wonogiri|Jawa Tengah|Jawa",-7.8167,110.9267], // jk-227
  ["Wonosobo|Jawa Tengah|Jawa",-7.3617,109.9], // jk-228
  ["Kab. Magelang (Mungkid)|Jawa Tengah|Jawa",-7.5833,110.2333], // jk-229
  ["Kab. Pekalongan (Kajen)|Jawa Tengah|Jawa",-7.0333,109.6], // jk-230
  ["Yogyakarta|DI Yogyakarta|Jawa",-7.7956,110.3695], // jk-231
  ["Sleman|DI Yogyakarta|Jawa",-7.7167,110.3556], // jk-232
  ["Bantul|DI Yogyakarta|Jawa",-7.8894,110.3289], // jk-233
  ["Gunungkidul (Wonosari)|DI Yogyakarta|Jawa",-7.9658,110.6019], // jk-234
  ["Kulon Progo (Wates)|DI Yogyakarta|Jawa",-7.8572,110.1608], // jk-235
  ["Surabaya|Jawa Timur|Jawa",-7.2575,112.7521], // jk-236
  ["Malang|Jawa Timur|Jawa",-7.9797,112.6304], // jk-237
  ["Batu|Jawa Timur|Jawa",-7.8711,112.5272], // jk-238
  ["Kediri|Jawa Timur|Jawa",-7.8167,112.0167], // jk-239
  ["Blitar|Jawa Timur|Jawa",-8.0983,112.1681], // jk-240
  ["Madiun|Jawa Timur|Jawa",-7.6298,111.5239], // jk-241
  ["Mojokerto|Jawa Timur|Jawa",-7.4722,112.4339], // jk-242
  ["Pasuruan|Jawa Timur|Jawa",-7.6469,112.9078], // jk-243
  ["Probolinggo|Jawa Timur|Jawa",-7.7544,113.2158], // jk-244
  ["Bangkalan|Jawa Timur|Jawa",-7.0333,112.75], // jk-245
  ["Banyuwangi|Jawa Timur|Jawa",-8.2192,114.3692], // jk-246
  ["Bojonegoro|Jawa Timur|Jawa",-7.15,111.8833], // jk-247
  ["Bondowoso|Jawa Timur|Jawa",-7.9139,113.8214], // jk-248
  ["Gresik|Jawa Timur|Jawa",-7.1564,112.6558], // jk-249
  ["Jember|Jawa Timur|Jawa",-8.1725,113.7], // jk-250
  ["Jombang|Jawa Timur|Jawa",-7.5461,112.2331], // jk-251
  ["Lamongan|Jawa Timur|Jawa",-7.1194,112.4139], // jk-252
  ["Lumajang|Jawa Timur|Jawa",-8.1333,113.2167], // jk-253
  ["Magetan|Jawa Timur|Jawa",-7.6539,111.3283], // jk-254
  ["Nganjuk|Jawa Timur|Jawa",-7.6039,111.9039], // jk-255
  ["Ngawi|Jawa Timur|Jawa",-7.4039,111.4456], // jk-256
  ["Pacitan|Jawa Timur|Jawa",-8.2047,111.0928], // jk-257
  ["Pamekasan|Jawa Timur|Jawa",-7.1608,113.4739], // jk-258
  ["Ponorogo|Jawa Timur|Jawa",-7.8683,111.4628], // jk-259
  ["Sampang|Jawa Timur|Jawa",-7.1878,113.2394], // jk-260
  ["Sidoarjo|Jawa Timur|Jawa",-7.4478,112.7183], // jk-261
  ["Situbondo|Jawa Timur|Jawa",-7.7064,114.0044], // jk-262
  ["Sumenep|Jawa Timur|Jawa",-7.0167,113.8667], // jk-263
  ["Trenggalek|Jawa Timur|Jawa",-8.05,111.7167], // jk-264
  ["Tuban|Jawa Timur|Jawa",-6.8978,112.065], // jk-265
  ["Tulungagung|Jawa Timur|Jawa",-8.0667,111.9], // jk-266
  ["Kab. Blitar (Kanigoro)|Jawa Timur|Jawa",-8.1333,112.2167], // jk-267
  ["Kab. Kediri (Ngasem/Pare)|Jawa Timur|Jawa",-7.7667,112.1833], // jk-268
  ["Kab. Madiun (Caruban)|Jawa Timur|Jawa",-7.55,111.65], // jk-269
  ["Kab. Malang (Kepanjen)|Jawa Timur|Jawa",-8.1333,112.5667], // jk-270
  ["Kab. Mojokerto (Mojosari)|Jawa Timur|Jawa",-7.5167,112.55], // jk-271
  ["Kab. Pasuruan (Bangil)|Jawa Timur|Jawa",-7.5833,112.8], // jk-272
  ["Kab. Probolinggo (Kraksaan)|Jawa Timur|Jawa",-7.7667,113.4333], // jk-273
  ["Denpasar|Bali|Bali & Nusa Tenggara",-8.6705,115.2126], // jk-274
  ["Badung (Kuta / Mangupura)|Bali|Bali & Nusa Tenggara",-8.5833,115.1833], // jk-275
  ["Bangli|Bali|Bali & Nusa Tenggara",-8.4542,115.355], // jk-276
  ["Buleleng (Singaraja)|Bali|Bali & Nusa Tenggara",-8.112,115.0882], // jk-277
  ["Gianyar (Ubud)|Bali|Bali & Nusa Tenggara",-8.5414,115.3253], // jk-278
  ["Jembrana (Negara)|Bali|Bali & Nusa Tenggara",-8.3583,114.6167], // jk-279
  ["Karangasem (Amlapura)|Bali|Bali & Nusa Tenggara",-8.4478,115.6128], // jk-280
  ["Klungkung (Semarapura)|Bali|Bali & Nusa Tenggara",-8.5358,115.4039], // jk-281
  ["Tabanan|Bali|Bali & Nusa Tenggara",-8.5392,115.1247], // jk-282
  ["Mataram|Nusa Tenggara Barat|Bali & Nusa Tenggara",-8.5833,116.1167], // jk-283
  ["Bima|Nusa Tenggara Barat|Bali & Nusa Tenggara",-8.4608,118.7256], // jk-284
  ["Lombok Barat (Gerung)|Nusa Tenggara Barat|Bali & Nusa Tenggara",-8.6833,116.1333], // jk-285
  ["Lombok Tengah (Praya)|Nusa Tenggara Barat|Bali & Nusa Tenggara",-8.7,116.2833], // jk-286
  ["Lombok Timur (Selong)|Nusa Tenggara Barat|Bali & Nusa Tenggara",-8.65,116.5333], // jk-287
  ["Lombok Utara (Tanjung)|Nusa Tenggara Barat|Bali & Nusa Tenggara",-8.35,116.15], // jk-288
  ["Sumbawa (Sumbawa Besar)|Nusa Tenggara Barat|Bali & Nusa Tenggara",-8.5,117.4333], // jk-289
  ["Sumbawa Barat (Taliwang)|Nusa Tenggara Barat|Bali & Nusa Tenggara",-8.75,116.85], // jk-290
  ["Dompu|Nusa Tenggara Barat|Bali & Nusa Tenggara",-8.5333,118.4667], // jk-291
  ["Kab. Bima (Woha)|Nusa Tenggara Barat|Bali & Nusa Tenggara",-8.5833,118.7], // jk-292
  ["Kupang|Nusa Tenggara Timur|Bali & Nusa Tenggara",-10.1772,123.607], // jk-293
  ["Alor (Kalabahi)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-8.2167,124.5167], // jk-294
  ["Belu (Atambua)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-9.1069,124.8925], // jk-295
  ["Ende|Nusa Tenggara Timur|Bali & Nusa Tenggara",-8.8433,121.6622], // jk-296
  ["Flores Timur (Larantuka)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-8.3433,122.9856], // jk-297
  ["Lembata (Lewoleba)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-8.3667,123.55], // jk-298
  ["Malaka (Betun)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-9.5667,124.9], // jk-299
  ["Manggarai (Ruteng)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-8.6133,120.4722], // jk-300
  ["Manggarai Barat (Labuan Bajo)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-8.4964,119.8878], // jk-301
  ["Manggarai Timur (Borong)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-8.8167,120.6167], // jk-302
  ["Nagekeo (Mbay)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-8.5667,121.3167], // jk-303
  ["Ngada (Bajawa)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-8.7917,120.9639], // jk-304
  ["Rote Ndao (Baa)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-10.7333,123.1167], // jk-305
  ["Sabu Raijua (Menia)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-10.5333,121.8333], // jk-306
  ["Sikka (Maumere)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-8.6197,122.2111], // jk-307
  ["Sumba Barat (Waikabubak)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-9.6333,119.4167], // jk-308
  ["Sumba Barat Daya (Tambolaka)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-9.4,119.2333], // jk-309
  ["Sumba Tengah (Waibakul)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-9.6,119.6], // jk-310
  ["Sumba Timur (Waingapu)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-9.6542,120.2642], // jk-311
  ["Timor Tengah Selatan (Soe)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-9.8608,124.2764], // jk-312
  ["Timor Tengah Utara (Kefamenanu)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-9.4447,124.4781], // jk-313
  ["Kab. Kupang (Oelamasi)|Nusa Tenggara Timur|Bali & Nusa Tenggara",-10.05,123.8333], // jk-314
  ["Pontianak|Kalimantan Barat|Kalimantan",-0.0263,109.3425], // jk-315
  ["Singkawang|Kalimantan Barat|Kalimantan",0.9072,108.9867], // jk-316
  ["Bengkayang|Kalimantan Barat|Kalimantan",0.8167,109.4833], // jk-317
  ["Kapuas Hulu (Putussibau)|Kalimantan Barat|Kalimantan",0.85,112.9333], // jk-318
  ["Kayong Utara (Sukadana)|Kalimantan Barat|Kalimantan",-1.25,109.95], // jk-319
  ["Ketapang|Kalimantan Barat|Kalimantan",-1.85,109.9833], // jk-320
  ["Kubu Raya (Sungai Raya)|Kalimantan Barat|Kalimantan",-0.1167,109.4], // jk-321
  ["Landak (Ngabang)|Kalimantan Barat|Kalimantan",0.3833,109.9667], // jk-322
  ["Melawi (Nanga Pinoh)|Kalimantan Barat|Kalimantan",-0.3333,111.7], // jk-323
  ["Mempawah|Kalimantan Barat|Kalimantan",0.25,109.1833], // jk-324
  ["Sambas|Kalimantan Barat|Kalimantan",1.35,109.3], // jk-325
  ["Sanggau|Kalimantan Barat|Kalimantan",0.1167,110.5833], // jk-326
  ["Sekadau|Kalimantan Barat|Kalimantan",0.0333,110.95], // jk-327
  ["Sintang|Kalimantan Barat|Kalimantan",0.0667,111.5], // jk-328
  ["Palangka Raya|Kalimantan Tengah|Kalimantan",-2.2161,113.9167], // jk-329
  ["Barito Selatan (Buntok)|Kalimantan Tengah|Kalimantan",-1.7167,114.85], // jk-330
  ["Barito Timur (Tamiang Layang)|Kalimantan Tengah|Kalimantan",-2,115.1667], // jk-331
  ["Barito Utara (Muara Teweh)|Kalimantan Tengah|Kalimantan",-0.95,114.9], // jk-332
  ["Gunung Mas (Kuala Kurun)|Kalimantan Tengah|Kalimantan",-1.1333,113.8667], // jk-333
  ["Kapuas (Kuala Kapuas)|Kalimantan Tengah|Kalimantan",-3.0092,114.3875], // jk-334
  ["Katingan (Kasongan)|Kalimantan Tengah|Kalimantan",-1.9,113.3833], // jk-335
  ["Kotawaringin Barat (Pangkalan Bun)|Kalimantan Tengah|Kalimantan",-2.6833,111.6167], // jk-336
  ["Kotawaringin Timur (Sampit)|Kalimantan Tengah|Kalimantan",-2.5333,112.95], // jk-337
  ["Lamandau (Nanga Bulik)|Kalimantan Tengah|Kalimantan",-2.1667,111.45], // jk-338
  ["Murung Raya (Puruk Cahu)|Kalimantan Tengah|Kalimantan",-0.6167,114.5833], // jk-339
  ["Pulang Pisau|Kalimantan Tengah|Kalimantan",-2.75,114.25], // jk-340
  ["Sukamara|Kalimantan Tengah|Kalimantan",-2.6333,111.2333], // jk-341
  ["Seruyan (Kuala Pembuang)|Kalimantan Tengah|Kalimantan",-3.3,112.55], // jk-342
  ["Banjarmasin|Kalimantan Selatan|Kalimantan",-3.3194,114.5908], // jk-343
  ["Banjarbaru|Kalimantan Selatan|Kalimantan",-3.44,114.83], // jk-344
  ["Balangan (Paringin)|Kalimantan Selatan|Kalimantan",-2.3333,115.4667], // jk-345
  ["Banjar (Martapura)|Kalimantan Selatan|Kalimantan",-3.4167,114.85], // jk-346
  ["Barito Kuala (Marabahan)|Kalimantan Selatan|Kalimantan",-2.9833,114.7667], // jk-347
  ["Hulu Sungai Selatan (Kandangan)|Kalimantan Selatan|Kalimantan",-2.7833,115.2667], // jk-348
  ["Hulu Sungai Tengah (Barabai)|Kalimantan Selatan|Kalimantan",-2.5833,115.3833], // jk-349
  ["Hulu Sungai Utara (Amuntai)|Kalimantan Selatan|Kalimantan",-2.4167,115.25], // jk-350
  ["Kotabaru|Kalimantan Selatan|Kalimantan",-3.25,116.2167], // jk-351
  ["Tabalong (Tanjung)|Kalimantan Selatan|Kalimantan",-2.1833,115.3833], // jk-352
  ["Tanah Bumbu (Batulicin)|Kalimantan Selatan|Kalimantan",-3.45,116], // jk-353
  ["Tanah Laut (Pelaihari)|Kalimantan Selatan|Kalimantan",-3.8,114.7667], // jk-354
  ["Tapin (Rantau)|Kalimantan Selatan|Kalimantan",-2.9333,115.15], // jk-355
  ["Samarinda|Kalimantan Timur|Kalimantan",-0.5022,117.1536], // jk-356
  ["Balikpapan|Kalimantan Timur|Kalimantan",-1.2654,116.8312], // jk-357
  ["Bontang|Kalimantan Timur|Kalimantan",0.1333,117.5], // jk-358
  ["Nusantara (IKN Sepaku)|Kalimantan Timur|Kalimantan",-0.97,116.7], // jk-359
  ["Berau (Tanjung Redeb)|Kalimantan Timur|Kalimantan",2.15,117.5], // jk-360
  ["Kutai Barat (Sendawar)|Kalimantan Timur|Kalimantan",-0.2333,115.7], // jk-361
  ["Kutai Kartanegara (Tenggarong)|Kalimantan Timur|Kalimantan",-0.4167,116.9833], // jk-362
  ["Kutai Timur (Sangatta)|Kalimantan Timur|Kalimantan",0.5,117.55], // jk-363
  ["Mahakam Ulu (Ujoh Bilang)|Kalimantan Timur|Kalimantan",0.6333,114.85], // jk-364
  ["Paser (Tanah Grogot)|Kalimantan Timur|Kalimantan",-1.9,116.2], // jk-365
  ["Penajam Paser Utara (Penajam)|Kalimantan Timur|Kalimantan",-1.3333,116.75], // jk-366
  ["Tarakan|Kalimantan Utara|Kalimantan",3.3,117.6333], // jk-367
  ["Bulungan (Tanjung Selor)|Kalimantan Utara|Kalimantan",2.85,117.3667], // jk-368
  ["Malinau|Kalimantan Utara|Kalimantan",3.5833,116.6333], // jk-369
  ["Nunukan|Kalimantan Utara|Kalimantan",4.1333,117.65], // jk-370
  ["Tana Tidung (Tideng Pale)|Kalimantan Utara|Kalimantan",3.55,117.25], // jk-371
  ["Manado|Sulawesi Utara|Sulawesi",1.4748,124.8428], // jk-372
  ["Bitung|Sulawesi Utara|Sulawesi",1.4451,125.1889], // jk-373
  ["Kotamobagu|Sulawesi Utara|Sulawesi",0.7306,124.3139], // jk-374
  ["Tomohon|Sulawesi Utara|Sulawesi",1.3289,124.8392], // jk-375
  ["Bolaang Mongondow (Lolak)|Sulawesi Utara|Sulawesi",0.8833,124.0167], // jk-376
  ["Bolaang Mongondow Selatan (Bolaang Uki)|Sulawesi Utara|Sulawesi",0.35,123.9], // jk-377
  ["Bolaang Mongondow Timur (Tutuyan)|Sulawesi Utara|Sulawesi",0.7667,124.6], // jk-378
  ["Bolaang Mongondow Utara (Boroko)|Sulawesi Utara|Sulawesi",0.9333,123.3167], // jk-379
  ["Kepulauan Sangihe (Tahuna)|Sulawesi Utara|Sulawesi",3.6167,125.4833], // jk-380
  ["Kepulauan Siau Tagulandang Biaro - Sitaro (Ondong)|Sulawesi Utara|Sulawesi",2.75,125.4], // jk-381
  ["Kepulauan Talaud (Melonguane)|Sulawesi Utara|Sulawesi",4,126.7], // jk-382
  ["Minahasa (Tondano)|Sulawesi Utara|Sulawesi",1.3,124.9167], // jk-383
  ["Minahasa Selatan (Amurang)|Sulawesi Utara|Sulawesi",1.1833,124.5667], // jk-384
  ["Minahasa Tenggara (Ratahan)|Sulawesi Utara|Sulawesi",1.05,124.8], // jk-385
  ["Minahasa Utara (Airmadidi)|Sulawesi Utara|Sulawesi",1.4167,124.9833], // jk-386
  ["Kota Gorontalo|Gorontalo|Sulawesi",0.5435,123.0568], // jk-387
  ["Boalemo (Tilamuta)|Gorontalo|Sulawesi",0.5333,122.3333], // jk-388
  ["Bone Bolango (Suwawa)|Gorontalo|Sulawesi",0.55,123.15], // jk-389
  ["Gorontalo (Limboto)|Gorontalo|Sulawesi",0.6333,122.9833], // jk-390
  ["Gorontalo Utara (Kwandang)|Gorontalo|Sulawesi",0.8333,122.9167], // jk-391
  ["Pohuwato (Marisa)|Gorontalo|Sulawesi",0.45,121.9333], // jk-392
  ["Palu|Sulawesi Tengah|Sulawesi",-0.8917,119.8707], // jk-393
  ["Banggai (Luwuk)|Sulawesi Tengah|Sulawesi",-0.95,122.7833], // jk-394
  ["Banggai Kepulauan (Salakan)|Sulawesi Tengah|Sulawesi",-1.3333,123.1667], // jk-395
  ["Banggai Laut (Banggai)|Sulawesi Tengah|Sulawesi",-1.6,123.5], // jk-396
  ["Buol|Sulawesi Tengah|Sulawesi",1.1667,121.4167], // jk-397
  ["Donggala (Banawa)|Sulawesi Tengah|Sulawesi",-0.6833,119.75], // jk-398
  ["Morowali (Bungku)|Sulawesi Tengah|Sulawesi",-2.5333,121.9667], // jk-399
  ["Morowali Utara (Kolonodale)|Sulawesi Tengah|Sulawesi",-1.9833,121.3333], // jk-400
  ["Parigi Moutong (Parigi)|Sulawesi Tengah|Sulawesi",-0.8,120.1833], // jk-401
  ["Poso|Sulawesi Tengah|Sulawesi",-1.3986,120.7533], // jk-402
  ["Sigi (Sigi Biromaru)|Sulawesi Tengah|Sulawesi",-1.0167,119.9333], // jk-403
  ["Tojo Una-Una (Ampana)|Sulawesi Tengah|Sulawesi",-0.8667,121.5833], // jk-404
  ["Tolitoli|Sulawesi Tengah|Sulawesi",1.05,120.8], // jk-405
  ["Mamuju|Sulawesi Barat|Sulawesi",-2.6748,118.8888], // jk-406
  ["Majene|Sulawesi Barat|Sulawesi",-3.5333,118.9667], // jk-407
  ["Mamasa|Sulawesi Barat|Sulawesi",-2.9333,119.3833], // jk-408
  ["Mamuju Tengah (Tobadak)|Sulawesi Barat|Sulawesi",-2.1,119.4], // jk-409
  ["Pasangkayu|Sulawesi Barat|Sulawesi",-1.1833,119.3833], // jk-410
  ["Polewali Mandar (Polewali)|Sulawesi Barat|Sulawesi",-3.4333,119.35], // jk-411
  ["Makassar|Sulawesi Selatan|Sulawesi",-5.1477,119.4327], // jk-412
  ["Palopo|Sulawesi Selatan|Sulawesi",-2.9944,120.1969], // jk-413
  ["Parepare|Sulawesi Selatan|Sulawesi",-4.0133,119.6272], // jk-414
  ["Bantaeng|Sulawesi Selatan|Sulawesi",-5.55,119.95], // jk-415
  ["Barru|Sulawesi Selatan|Sulawesi",-4.4167,119.6833], // jk-416
  ["Bone (Watampone)|Sulawesi Selatan|Sulawesi",-4.5386,120.3278], // jk-417
  ["Bulukumba|Sulawesi Selatan|Sulawesi",-5.55,120.1833], // jk-418
  ["Enrekang|Sulawesi Selatan|Sulawesi",-3.5667,119.7833], // jk-419
  ["Gowa (Sungguminasa)|Sulawesi Selatan|Sulawesi",-5.2,119.45], // jk-420
  ["Jeneponto (Bontosunggu)|Sulawesi Selatan|Sulawesi",-5.6833,119.7333], // jk-421
  ["Kepulauan Selayar (Benteng)|Sulawesi Selatan|Sulawesi",-6.1167,120.4667], // jk-422
  ["Luwu (Belopa)|Sulawesi Selatan|Sulawesi",-3.3667,120.35], // jk-423
  ["Luwu Timur (Malili)|Sulawesi Selatan|Sulawesi",-2.6,121.1], // jk-424
  ["Luwu Utara (Masamba)|Sulawesi Selatan|Sulawesi",-2.55,120.3167], // jk-425
  ["Maros (Turikale)|Sulawesi Selatan|Sulawesi",-5,119.5833], // jk-426
  ["Pangkajene dan Kepulauan - Pangkep|Sulawesi Selatan|Sulawesi",-4.8167,119.55], // jk-427
  ["Pinrang|Sulawesi Selatan|Sulawesi",-3.7833,119.65], // jk-428
  ["Sidenreng Rappang - Sidrap (Pangkajene)|Sulawesi Selatan|Sulawesi",-3.9333,119.8], // jk-429
  ["Sinjai|Sulawesi Selatan|Sulawesi",-5.1333,120.25], // jk-430
  ["Soppeng (Watansoppeng)|Sulawesi Selatan|Sulawesi",-4.35,119.8833], // jk-431
  ["Takalar (Pattallassang)|Sulawesi Selatan|Sulawesi",-5.4167,119.45], // jk-432
  ["Tana Toraja (Makale)|Sulawesi Selatan|Sulawesi",-3.1,119.8667], // jk-433
  ["Toraja Utara (Rantepao)|Sulawesi Selatan|Sulawesi",-2.9667,119.9], // jk-434
  ["Wajo (Sengkang)|Sulawesi Selatan|Sulawesi",-4.1333,120.0333], // jk-435
  ["Kendari|Sulawesi Tenggara|Sulawesi",-3.9985,122.5126], // jk-436
  ["Baubau|Sulawesi Tenggara|Sulawesi",-5.4633,122.6022], // jk-437
  ["Bombana (Rumbia)|Sulawesi Tenggara|Sulawesi",-4.75,121.8333], // jk-438
  ["Buton (Pasarwajo)|Sulawesi Tenggara|Sulawesi",-5.3167,122.85], // jk-439
  ["Buton Selatan (Batauga)|Sulawesi Tenggara|Sulawesi",-5.5833,122.7], // jk-440
  ["Buton Tengah (Labungkari)|Sulawesi Tenggara|Sulawesi",-5.3333,122.45], // jk-441
  ["Buton Utara (Buranga)|Sulawesi Tenggara|Sulawesi",-4.8333,122.95], // jk-442
  ["Kolaka|Sulawesi Tenggara|Sulawesi",-4.05,121.6], // jk-443
  ["Kolaka Timur (Tirawuta)|Sulawesi Tenggara|Sulawesi",-4.1333,121.9], // jk-444
  ["Kolaka Utara (Lasusua)|Sulawesi Tenggara|Sulawesi",-3.3667,121.05], // jk-445
  ["Konawe (Unaaha)|Sulawesi Tenggara|Sulawesi",-3.8667,122.0667], // jk-446
  ["Konawe Kepulauan (Langara)|Sulawesi Tenggara|Sulawesi",-4.0167,123.0167], // jk-447
  ["Konawe Selatan (Andoolo)|Sulawesi Tenggara|Sulawesi",-4.3333,122.25], // jk-448
  ["Konawe Utara (Wanggudu)|Sulawesi Tenggara|Sulawesi",-3.4833,122.1333], // jk-449
  ["Muna (Raha)|Sulawesi Tenggara|Sulawesi",-4.85,122.7167], // jk-450
  ["Muna Barat (Sawerigadi)|Sulawesi Tenggara|Sulawesi",-4.8333,122.4667], // jk-451
  ["Wakatobi (Wangi-Wangi)|Sulawesi Tenggara|Sulawesi",-5.3167,123.5833], // jk-452
  ["Ambon|Maluku|Maluku & Papua",-3.6554,128.1908], // jk-453
  ["Tual|Maluku|Maluku & Papua",-5.6333,132.75], // jk-454
  ["Buru (Namlea)|Maluku|Maluku & Papua",-3.25,127.1], // jk-455
  ["Buru Selatan (Namrole)|Maluku|Maluku & Papua",-3.85,126.75], // jk-456
  ["Kepulauan Aru (Dobo)|Maluku|Maluku & Papua",-5.7667,134.2167], // jk-457
  ["Kepulauan Tanimbar (Saumlaki)|Maluku|Maluku & Papua",-7.9833,131.3], // jk-458
  ["Maluku Barat Daya (Tiakur)|Maluku|Maluku & Papua",-8.1333,127.9167], // jk-459
  ["Maluku Tengah (Masohi)|Maluku|Maluku & Papua",-3.3,128.95], // jk-460
  ["Maluku Tenggara (Langgur)|Maluku|Maluku & Papua",-5.65,132.7333], // jk-461
  ["Seram Bagian Barat (Piru)|Maluku|Maluku & Papua",-3.0667,128.1833], // jk-462
  ["Seram Bagian Timur (Bula)|Maluku|Maluku & Papua",-3.1,130.5], // jk-463
  ["Ternate|Maluku Utara|Maluku & Papua",0.7893,127.361], // jk-464
  ["Tidore Kepulauan|Maluku Utara|Maluku & Papua",0.6833,127.4], // jk-465
  ["Halmahera Barat (Jailolo)|Maluku Utara|Maluku & Papua",1.0667,127.4667], // jk-466
  ["Halmahera Tengah (Weda)|Maluku Utara|Maluku & Papua",0.3333,127.8833], // jk-467
  ["Halmahera Timur (Maba)|Maluku Utara|Maluku & Papua",0.7,128.3], // jk-468
  ["Halmahera Selatan (Labuha)|Maluku Utara|Maluku & Papua",-0.6333,127.4833], // jk-469
  ["Halmahera Utara (Tobelo)|Maluku Utara|Maluku & Papua",1.7333,128.0167], // jk-470
  ["Kepulauan Sula (Sanana)|Maluku Utara|Maluku & Papua",-2.05,125.9833], // jk-471
  ["Pulau Morotai (Daruba)|Maluku Utara|Maluku & Papua",2.05,128.2833], // jk-472
  ["Pulau Taliabu (Bobong)|Maluku Utara|Maluku & Papua",-1.9167,124.3833], // jk-473
  ["Jayapura|Papua|Maluku & Papua",-2.5337,140.7181], // jk-474
  ["Kab. Jayapura (Sentani)|Papua|Maluku & Papua",-2.5667,140.5167], // jk-475
  ["Biak Numfor|Papua|Maluku & Papua",-1.1833,136.0833], // jk-476
  ["Keerom (Waris)|Papua|Maluku & Papua",-3.2833,140.7833], // jk-477
  ["Kepulauan Yapen (Serui)|Papua|Maluku & Papua",-1.8667,136.2333], // jk-478
  ["Mamberamo Raya (Burmeso)|Papua|Maluku & Papua",-2.1833,138.1667], // jk-479
  ["Sarmi|Papua|Maluku & Papua",-1.8667,138.75], // jk-480
  ["Supiori (Sorendiweri)|Papua|Maluku & Papua",-0.7333,135.6167], // jk-481
  ["Waropen (Botawa)|Papua|Maluku & Papua",-2.6333,136.75], // jk-482
  ["Manokwari|Papua Barat|Maluku & Papua",-0.8615,134.062], // jk-483
  ["Fakfak|Papua Barat|Maluku & Papua",-2.9167,132.3], // jk-484
  ["Kaimana|Papua Barat|Maluku & Papua",-3.6667,133.7667], // jk-485
  ["Manokwari Selatan (Ransiki)|Papua Barat|Maluku & Papua",-1.5,134.1833], // jk-486
  ["Pegunungan Arfak (Anggi)|Papua Barat|Maluku & Papua",-1.3667,133.9167], // jk-487
  ["Teluk Bintuni (Bintuni)|Papua Barat|Maluku & Papua",-2.1333,133.5167], // jk-488
  ["Teluk Wondama (Rasiei)|Papua Barat|Maluku & Papua",-2.7,134.5], // jk-489
  ["Sorong|Papua Barat Daya|Maluku & Papua",-0.8762,131.2558], // jk-490
  ["Kab. Sorong (Aimas)|Papua Barat Daya|Maluku & Papua",-0.9667,131.3333], // jk-491
  ["Raja Ampat (Waisai)|Papua Barat Daya|Maluku & Papua",-0.4333,130.8167], // jk-492
  ["Sorong Selatan (Teminabuan)|Papua Barat Daya|Maluku & Papua",-1.4833,132.0167], // jk-493
  ["Tambrauw (Fef)|Papua Barat Daya|Maluku & Papua",-0.6333,132.4833], // jk-494
  ["Maybrat (Kumurkek)|Papua Barat Daya|Maluku & Papua",-1.2833,132.3667], // jk-495
  ["Merauke|Papua Selatan|Maluku & Papua",-8.4991,140.4018], // jk-496
  ["Asmat (Agats)|Papua Selatan|Maluku & Papua",-5.5333,138.1333], // jk-497
  ["Boven Digoel (Tanah Merah)|Papua Selatan|Maluku & Papua",-6.1,140.3], // jk-498
  ["Mappi (Kepi)|Papua Selatan|Maluku & Papua",-6.5,139.3167], // jk-499
  ["Nabire|Papua Tengah|Maluku & Papua",-3.3667,135.5], // jk-500
  ["Mimika (Timika)|Papua Tengah|Maluku & Papua",-4.5467,136.8839], // jk-501
  ["Deiyai (Tigi)|Papua Tengah|Maluku & Papua",-4.0167,136], // jk-502
  ["Dogiyai (Kigamani)|Papua Tengah|Maluku & Papua",-4.05,135.75], // jk-503
  ["Intan Jaya (Sugapa)|Papua Tengah|Maluku & Papua",-3.75,137.0333], // jk-504
  ["Paniai (Enarotali)|Papua Tengah|Maluku & Papua",-3.9167,136.3667], // jk-505
  ["Puncak (Ilaga)|Papua Tengah|Maluku & Papua",-3.9833,137.6167], // jk-506
  ["Puncak Jaya (Kotamulia)|Papua Tengah|Maluku & Papua",-3.7333,137.95], // jk-507
  ["Jayawijaya (Wamena)|Papua Pegunungan|Maluku & Papua",-4.0956,138.9442], // jk-508
  ["Lanny Jaya (Tiom)|Papua Pegunungan|Maluku & Papua",-3.9,138.45], // jk-509
  ["Mamberamo Tengah (Kobakma)|Papua Pegunungan|Maluku & Papua",-3.4,139.1], // jk-510
  ["Nduga (Kenyam)|Papua Pegunungan|Maluku & Papua",-4.4167,138.5667], // jk-511
  ["Pegunungan Bintang (Oksibil)|Papua Pegunungan|Maluku & Papua",-4.9,140.6333], // jk-512
  ["Tolikara (Karubaga)|Papua Pegunungan|Maluku & Papua",-3.6167,138.65], // jk-513
  ["Yahukimo (Dekai)|Papua Pegunungan|Maluku & Papua",-4.8333,139.5], // jk-514
  ["Yalimo (Elelim)|Papua Pegunungan|Maluku & Papua",-3.7833,139.4], // jk-515
];
function _urai(row, i) {
  const [kunci, lat, lon] = row;
  const [name, province, region] = kunci.split('|');
  return { name, province, region, lat, lon };
}
export const INDONESIA_CITIES = _TABEL.map(_urai);
function _slug(s = '') { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
function _tier(region = '') {
  if (/jawa/i.test(region)) return 'padat';
  if (/sumatera|sulawesi/i.test(region)) return 'menengah';
  return 'kepulauan';
}
export const KOTA_JAGA = INDONESIA_CITIES.map((k, i) => ({ ...k, id: `jk-${i + 1}-${_slug(k.name)}`, slug: _slug(`${k.name}-${k.province}`), tier: _tier(k.region) }));
export const PETA_KOTA = new Map(KOTA_JAGA.map((k) => [k.slug, k]));
export function cariKota(keyword = '', batas = 12) {
  const q = _slug(keyword);
  if (!q) return [];
  const hasil = [];
  for (const k of KOTA_JAGA) { if (k.slug.includes(q)) { hasil.push(k); if (hasil.length >= batas) break; } }
  return hasil;
}
export const findCity = cariKota;
export default KOTA_JAGA;
