a = Array.new
b = Array.new
b << 

1000.times {|i|
 a << i
}

1000.times {|s|
 b << s + 2000
}

a.each {|aa|
  p aa    
}

b.each {|bb|
  p bb
}